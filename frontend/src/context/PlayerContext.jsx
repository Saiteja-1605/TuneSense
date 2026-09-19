import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { historyApi } from '../api';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [playlistModalTrack, setPlaylistModalTrack] = useState(null);

  // Track playback duration for ML engine event recording
  const playTimeRef = useRef(0);
  const hasLoggedRef = useRef(false);
  const currentTrackRef = useRef(null);
  currentTrackRef.current = currentTrack;

  // Initialize HTML5 Audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      playTimeRef.current = Math.floor(audio.currentTime);

      // Auto-record listening event if listened for >= 30 seconds
      if (playTimeRef.current >= 30 && !hasLoggedRef.current && currentTrackRef.current) {
        hasLoggedRef.current = true;
        historyApi.recordListening({
          song_id: currentTrackRef.current.song_id,
          duration_listened: playTimeRef.current,
          completed: false,
        }).catch(() => {});
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentTrackRef.current?.duration || 0);
    };

    const handleEnded = () => {
      if (currentTrackRef.current) {
        historyApi.recordListening({
          song_id: currentTrackRef.current.song_id,
          duration_listened: playTimeRef.current,
          completed: true,
        }).catch(() => {});
      }
      playNextAuto();
    };

    const handleError = (e) => {
      console.warn('Audio playback notice:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playNextAuto = useCallback(() => {
    setRepeatMode((currRepeat) => {
      if (currRepeat === 'one' && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        return currRepeat;
      }

      setQueue((currQueue) => {
        setQueueIndex((currIndex) => {
          if (currQueue.length === 0) return -1;

          let nextIdx = currIndex + 1;
          if (nextIdx >= currQueue.length) {
            if (currRepeat === 'all') {
              nextIdx = 0;
            } else {
              setIsPlaying(false);
              return currIndex;
            }
          }

          const nextTrack = currQueue[nextIdx];
          if (nextTrack) {
            playTrackInternal(nextTrack, nextIdx);
          }
          return nextIdx;
        });
        return currQueue;
      });

      return currRepeat;
    });
  }, []);

  const playTrackInternal = (track, index) => {
    if (!audioRef.current || !track) return;
    hasLoggedRef.current = false;
    playTimeRef.current = 0;

    setCurrentTrack(track);
    setQueueIndex(index);
    setCurrentTime(0);
    setDuration(track.duration || 0);

    const source = track.audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    audioRef.current.src = source;
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.warn('Audio play request interrupted or requires interaction:', err);
        setIsPlaying(false);
      });
  };

  const playTrack = useCallback((track, newQueue = null) => {
    if (!track) return;

    if (newQueue && Array.isArray(newQueue) && newQueue.length > 0) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((s) => s.song_id === track.song_id);
      const targetIdx = idx >= 0 ? idx : 0;
      playTrackInternal(track, targetIdx);
    } else {
      setQueue((prev) => {
        const existingIdx = prev.findIndex((s) => s.song_id === track.song_id);
        if (existingIdx >= 0) {
          playTrackInternal(track, existingIdx);
          return prev;
        }
        const updated = [track, ...prev];
        playTrackInternal(track, 0);
        return updated;
      });
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isPlaying, currentTrack]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIdx;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = queueIndex + 1;
      if (nextIdx >= queue.length) {
        nextIdx = repeatMode === 'all' ? 0 : queueIndex;
      }
    }
    if (nextIdx !== queueIndex || repeatMode === 'all' || isShuffle) {
      playTrackInternal(queue[nextIdx], nextIdx);
    }
  }, [queue, queueIndex, isShuffle, repeatMode]);

  const playPrevious = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = repeatMode === 'all' ? queue.length - 1 : 0;
    }
    playTrackInternal(queue[prevIdx], prevIdx);
  }, [queue, queueIndex, repeatMode]);

  const seekTo = useCallback((seconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((newVol) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(1, newVol));
    audioRef.current.volume = clamped;
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (index < queueIndex) {
        setQueueIndex((curr) => curr - 1);
      }
      return next;
    });
  }, [queueIndex]);

  const clearQueue = useCallback(() => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  }, [currentTrack]);

  const toggleQueueOpen = useCallback(() => {
    setIsQueueOpen((prev) => !prev);
  }, []);

  const openPlaylistModal = useCallback((track) => {
    setPlaylistModalTrack(track);
  }, []);

  const closePlaylistModal = useCallback(() => {
    setPlaylistModalTrack(null);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        isQueueOpen,
        playlistModalTrack,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeatMode,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggleQueueOpen,
        openPlaylistModal,
        closePlaylistModal,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
