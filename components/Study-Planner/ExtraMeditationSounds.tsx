"use client";

import React, { useEffect, useRef, useState } from "react";

type SavedPersonalAudio = {
  name: string;
  type: string;
  blob: Blob;
  savedAt: string;
};

const DATABASE_NAME = "affirmme_personal_audio_v1";
const STORE_NAME = "meditation_audio";
const AUDIO_KEY = "personal_meditation_track";
const MAX_FILE_SIZE = 30 * 1024 * 1024;

function openAudioDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePersonalAudio(file: File): Promise<void> {
  const database = await openAudioDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    const savedAudio: SavedPersonalAudio = {
      name: file.name,
      type: file.type || "audio/mpeg",
      blob: file,
      savedAt: new Date().toISOString(),
    };

    store.put(savedAudio, AUDIO_KEY);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

async function loadPersonalAudio(): Promise<SavedPersonalAudio | null> {
  const database = await openAudioDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(AUDIO_KEY);

    request.onsuccess = () => {
      database.close();
      resolve(
        (request.result as SavedPersonalAudio | undefined) ?? null
      );
    };

    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

async function deletePersonalAudio(): Promise<void> {
  const database = await openAudioDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction.objectStore(STORE_NAME).delete(AUDIO_KEY);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export default function ExtraMeditationSounds() {
  const [audioUrl, setAudioUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState(
    "Choose a personal meditation track from your device."
  );
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  function createPreviewUrl(blob: Blob, name: string) {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(blob);

    objectUrlRef.current = nextUrl;
    setAudioUrl(nextUrl);
    setFileName(name);
  }

  useEffect(() => {
    async function restoreSavedAudio() {
      try {
        const savedAudio = await loadPersonalAudio();

        if (savedAudio) {
          createPreviewUrl(savedAudio.blob, savedAudio.name);
          setStatus("Your personal meditation sound is ready.");
        }
      } catch {
        setStatus(
          "Choose a personal track. It will remain available during this visit."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSavedAudio();

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const looksLikeAudio =
      file.type.startsWith("audio/") ||
      /\.(mp3|m4a|wav|aac|ogg)$/i.test(file.name);

    if (!looksLikeAudio) {
      setStatus("Please choose an MP3, M4A, WAV, AAC, or OGG audio file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatus("Please choose an audio file smaller than 30 MB.");
      event.target.value = "";
      return;
    }

    audioRef.current?.pause();
    createPreviewUrl(file, file.name);
    setStatus("Saving your personal meditation sound…");

    try {
      await savePersonalAudio(file);
      setStatus("Saved privately on this device.");
    } catch {
      setStatus(
        "The sound is ready for this visit, but the browser could not save it permanently."
      );
    }

    event.target.value = "";
  }

  async function handleRemove() {
    audioRef.current?.pause();

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setAudioUrl("");
    setFileName("");
    setStatus("Choose a personal meditation track from your device.");

    try {
      await deletePersonalAudio();
    } catch {
      // The visual removal still succeeds if local storage is unavailable.
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs">
      <header className="space-y-1">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-emerald-300">
          My Meditation Sound Pack
        </p>

        <p className="text-[12px] leading-relaxed text-slate-400">
          Add calming music, affirmations, nature sounds, or another personal
          audio track from your device.
        </p>
      </header>

      <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
        <input
          id="personal-meditation-audio"
          type="file"
          accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg"
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <label
            htmlFor="personal-meditation-audio"
            className="cursor-pointer rounded-full border border-emerald-400 bg-emerald-500/90 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            {audioUrl ? "Replace Personal Sound" : "Choose Personal Sound"}
          </label>

          {audioUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-full border border-rose-400/70 bg-slate-950 px-4 py-3 text-sm font-semibold text-rose-200 hover:bg-rose-500/20"
            >
              Remove
            </button>
          )}
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
          {isLoading ? "Checking for a saved sound…" : status}
        </p>
      </div>

      {audioUrl && (
        <div className="space-y-3 rounded-xl border border-purple-500/50 bg-slate-950/80 p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-300">
              Personal Track
            </p>

            <p className="mt-1 break-words text-sm font-semibold text-slate-100">
              {fileName}
            </p>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            loop
            preload="metadata"
            className="w-full"
          >
            Your browser does not support audio playback.
          </audio>

          <p className="text-[11px] text-slate-500">
            Loop is enabled so your sound continues until you pause it.
          </p>
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-slate-500">
        Personal audio stays on this device and is not uploaded to AffirmMe.
      </p>
    </section>
  );
}