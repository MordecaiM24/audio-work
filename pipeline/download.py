import argparse
import json
import os
import re
import subprocess
import unicodedata
from typing import List, Optional, Tuple


def to_kebab_case(name: str) -> str:
    """
    Converts a string to kebab-case.
    This involves lowercasing, replacing spaces and special characters with hyphens,
    and normalizing unicode characters.
    """
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    name = re.sub(r"[^a-zA-Z0-9\s-]", "", name).strip().lower()
    name = re.sub(r"\s+", "-", name)
    name = re.sub(r"-+", "-", name)
    return name


def get_playlist_info(playlist_url: str) -> Tuple[Optional[str], Optional[List[dict]]]:
    """
    Retrieves playlist information using yt-dlp.
    Returns the playlist title and a list of video entries.
    """
    command = [
        "yt-dlp",
        "--flat-playlist",
        "--dump-single-json",  # Use dump-single-json to get playlist metadata correctly
        playlist_url,
    ]
    print(f"Fetching playlist info for: {playlist_url}")
    try:
        result = subprocess.run(
            command, capture_output=True, text=True, check=True, encoding="utf-8"
        )
        playlist_data = json.loads(result.stdout)
        playlist_title = playlist_data.get("title", "untitled-playlist")
        videos = playlist_data.get("entries", [])
        return playlist_title, videos
    except subprocess.CalledProcessError as e:
        print(f"Error fetching playlist info: {e.stderr}")
        return None, None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from yt-dlp: {e}")
        return None, None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None, None


def download_and_convert_video(video_url: str, output_path_template: str):
    """
    Downloads a video's audio and converts it, showing progress in the terminal.
    """
    command = [
        "yt-dlp",
        "-x",
        "--audio-format",
        "wav",
        "--postprocessor-args",
        "ffmpeg:-ar 16000 -ac 1 -c:a pcm_s16le",  # 16k mono 16bit wav bc whisper needs it
        "-o",
        f"{output_path_template}.%(ext)s",
        video_url,
    ]

    try:
        # Run subprocess without capturing output to show yt-dlp's progress bar
        subprocess.run(command, check=True)
        print(f"Successfully processed: {video_url}")
    except subprocess.CalledProcessError:
        # Error message from yt-dlp will be directly visible in the console
        print(
            f"\nAn error occurred while processing {video_url}. See output above for details."
        )
    except Exception as e:
        print(f"An unexpected script error occurred while processing {video_url}: {e}")


def process_playlist(
    playlist_url: str,
    title: Optional[str] = None,
    start: Optional[int] = None,
    end: Optional[int] = None,
) -> Optional[str]:
    """
    Core logic to process a playlist. Fetches video info, creates directories,
    and orchestrates the download and conversion for each video within the specified range.

    :param playlist_url: The URL of the YouTube playlist.
    :param title: Optional custom title for the main directory.
    :param start: The 1-based starting index of videos to process.
    :param end: The 1-based ending index of videos to process.
    :return: The path to the main directory where files were saved, or None on failure.
    """
    playlist_title, videos = get_playlist_info(playlist_url)

    if not videos:
        print("Could not retrieve playlist videos. Aborting.")
        return None

    start_index = (start - 1) if start else 0
    end_index = end if end else len(videos)

    videos_to_process = videos[start_index:end_index]
    total_to_process = len(videos_to_process)

    if total_to_process == 0:
        print("The specified range is empty or invalid. No videos to process.")
        return None

    print(
        f"Found {len(videos)} videos in playlist. Processing {total_to_process} from index {start_index + 1} to {end_index}."
    )

    # Create playlists directory structure
    playlists_dir = "playlists"
    if not os.path.exists(playlists_dir):
        os.makedirs(playlists_dir)
        print(f"Created playlists directory: {playlists_dir}")

    main_dir_name = to_kebab_case(title if title else playlist_title)
    full_path = os.path.join(playlists_dir, main_dir_name)

    if not os.path.exists(full_path):
        os.makedirs(full_path)
        print(f"Created collection directory: {full_path}")

    for i, video in enumerate(videos_to_process, 1):
        video_title = video.get("title", "untitled-video")
        video_url = video.get("url")

        if not video_url:
            print(f"Skipping entry without a URL: {video_title}")
            continue

        print("\n" + "=" * 50)
        print(f"Processing video {i} of {total_to_process}: '{video_title}'")
        print("=" * 50)

        video_kebab_title = to_kebab_case(video_title)
        video_dir = os.path.join(full_path, video_kebab_title)

        if not os.path.exists(video_dir):
            os.makedirs(video_dir)

        output_path_template = os.path.join(video_dir, video_kebab_title)

        download_and_convert_video(video_url, output_path_template)

    print(f"\nPlaylist processing complete. Files are in '{full_path}' directory.")
    return main_dir_name


# Example usage (uncomment to run directly):
# process_playlist(
#     "https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID",
#     title="your-collection-name",
#     start=1,
#     end=5,
# )
