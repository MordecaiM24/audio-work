"""Utilities for running speaker diarization on playlist audio files."""
from __future__ import annotations

import json
import os
from typing import List, Dict

from pyannote.audio import Pipeline
import torch


def load_pipeline() -> Pipeline:
    token = os.getenv("HF_TOKEN")
    pipeline = Pipeline.from_pretrained(
        "pyannote/speaker-diarization-3.1", use_auth_token=token
    )
    if torch.cuda.is_available():
        pipeline.to(torch.device("cuda"))
    return pipeline


def diarize_audio(pipeline: Pipeline, audio_path: str) -> List[Dict[str, float]]:
    diarization = pipeline(audio_path)
    segments: List[Dict[str, float]] = []
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        segments.append(
            {
                "start": float(round(turn.start, 2)),
                "end": float(round(turn.end, 2)),
                "speaker": speaker,
            }
        )
    return segments


def diarize_playlist(playlist_path: str) -> List[str]:
    pipeline = load_pipeline()
    results: List[str] = []
    for folder in os.listdir(playlist_path):
        folder_path = os.path.join(playlist_path, folder)
        if not os.path.isdir(folder_path):
            continue
        for file in os.listdir(folder_path):
            if not file.endswith(".wav"):
                continue
            audio_path = os.path.join(folder_path, file)
            segments = diarize_audio(pipeline, audio_path)
            out_path = audio_path.replace(".wav", ".diarization.json")
            with open(out_path, "w") as f:
                json.dump({"segments": segments}, f)
            results.append(out_path)
    return results
