"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "recorded" | "error";

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

export const MAX_RECORDING_SECONDS = 30;

function pickSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const mime of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return "";
}

function getFileExtension(mimeType: string): string {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("recording.webm");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const stopTracksAndTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state === "recording") {
        recorderRef.current.stop();
      }
      stopTracksAndTimer();
    };
  }, [stopTracksAndTimer]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsedMs(0);
    setErrorMessage(null);
    setStatus("idle");
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setStatus("error");
      setErrorMessage("Trình duyệt không hỗ trợ ghi âm MediaRecorder hoặc cần chạy trên localhost/HTTPS.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      setAudioBlob(null);
      setAudioUrl(null);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const effectiveMime = recorder.mimeType || mimeType || "audio/webm";
        const ext = getFileExtension(effectiveMime);
        const blob = new Blob(chunksRef.current, { type: effectiveMime });
        stopTracksAndTimer();

        if (blob.size === 0) {
          setStatus("error");
          setErrorMessage("Không thu được dữ liệu âm thanh nào. Hãy thử nói lại.");
          return;
        }

        const nextUrl = URL.createObjectURL(blob);
        setFilename(`voice-turn.${ext}`);
        setAudioBlob(blob);
        setAudioUrl(nextUrl);
        setStatus("recorded");
      };

      recorder.onerror = () => {
        stopTracksAndTimer();
        setStatus("error");
        setErrorMessage("Có lỗi xảy ra khi đang ghi âm.");
      };

      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setStatus("recording");
      recorder.start(250);

      timerRef.current = window.setInterval(() => {
        const nextElapsed = Date.now() - startedAtRef.current;
        setElapsedMs(nextElapsed);
        if (nextElapsed >= MAX_RECORDING_SECONDS * 1000 && recorder.state === "recording") {
          recorder.stop();
        }
      }, 200);
    } catch (error) {
      stopTracksAndTimer();
      setStatus("error");
      const detail = error instanceof Error ? error.message : String(error);
      setErrorMessage(`Không thể mở micro: ${detail}`);
    }
  }, [stopTracksAndTimer]);

  return {
    status,
    elapsedMs,
    audioBlob,
    audioUrl,
    filename,
    errorMessage,
    startRecording,
    stopRecording,
    clearRecording,
  };
}

