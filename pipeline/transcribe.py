import subprocess
import json
from typing import Tuple, Optional, List
import os


# to my knowledge, the python whisper library doesn't support coreml, so we're using the cli.
def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe the audio file using the Whisper model.
    """
    command = [
        "./build/bin/whisper-cli",
        "-m",
        "models/ggml-medium.en.bin",  # uses coreml model by default if already in library, otherwise defaults to ggml
        "-fa",  # flash attention
        "-f",
        audio_path,
        "-oj",
    ]
    try:
        result = subprocess.run(
            command,
            check=True,
        )
        print(result.stdout)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error transcribing audio: {e.stderr}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None


"""
playlist_title
  |-video-title-1
  |  |-video-title-1.wav
  |  |-video-title-1.wav.json (whisper output)
  |  |-video-title-1.json (final output)
  |-video-title-2
  |  |-video-title-2.wav
  |  |-video-title-2.wav.json (whisper output)
  |  |-video-title-2.json (final output)
"""


def rename_json(video_path: str) -> str:
    video_title = video_path.replace(".wav", "")
    with open(f"{video_title}.wav.json", "r") as f:
        data = json.load(f)
    with open(f"{video_title}.json", "w") as f:
        json.dump(data, f)
    os.remove(f"{video_title}.wav.json")


def transcribe_playlist(playlist_path: str) -> List[str]:
    for folder in os.listdir(playlist_path):
        if os.path.isdir(os.path.join(playlist_path, folder)):
            for file in os.listdir(os.path.join(playlist_path, folder)):
                if file.endswith(".wav"):
                    video_path = os.path.join(playlist_path, folder, file)
                    transcribe_audio(video_path)
                    rename_json(video_path)


# Example usage (uncomment to run directly):
# transcribe_playlist("your-collection-name")
