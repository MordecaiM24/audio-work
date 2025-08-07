import os

total_files = 0


# one liner to see how many files end in json recursively in the waveform folder
print(len(os.listdir("pipeline/waveform")))

print(
    len(
        [
            os.path.join(root, file)
            for root, dirs, files in os.walk("pipeline/waveform")
            for file in files
            if file.endswith(".json")
        ]
    )
)
