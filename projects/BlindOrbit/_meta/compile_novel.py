from pathlib import Path


project_root = Path(__file__).resolve().parents[1]
chapters_dir = project_root / "chapters"
output_file = project_root / "_archives" / "Full_Story_Draft.md"

files = [
    "Chap_00_Prologue_The_Tinderbox.md",
    "Chap_01_Europe_The_Chessboard.md",
    "Chap_02_Interlude_I_Silence_From_Above.md",
    "Chap_03_Asia_The_Blinding.md",
    "Chap_04_Asia_The_Ant_Colony.md",
    "Chap_05_Asia_Twenty_Years.md",
    "Chap_06_Europe_The_Suwałki_Deception.md",
    "Chap_07_Interlude_Pentagon_Vacuum.md",
    "Chap_08_Asia_The_Wave.md",
    "Chap_09_Asia_Tokyo_Choice.md",
    "Chap_10_MiddleEast_The_Package.md",
    "Chap_11_Asia_Implosion.md",
    "Chap_12_Interlude_II_The_Chameleon.md",
    "Chap_13_Asia_Island_Diary.md",
    "Chap_14_Asia_First_Blood.md",
    "Chap_15_Europe_The_Last_Train.md",
    "Chap_16_Europe_The_Other_Side.md",
    "Chap_17_Asia_Black_Fog.md",
    "Chap_18_MiddleEast_Glass_Maze.md",
    "Chap_19_Global_Silent_Fleet.md",
    "Chap_20_Interlude_III_Dragons_Eye.md",
    "Chap_21_Asia_The_Teacher.md",
    "Chap_22_Europe_Hunter_Hunted.md",
    "Chap_23_Asia_Island_Frequency.md",
    "Chap_24_Global_Pine_Gap_Heartbeat.md",
    "Chap_25_Global_Blood_Trail.md",
    "Chap_26_Global_The_Cipher.md",
    "Chap_27_Global_Night_of_Long_Knives.md",
    "Chap_28_Global_The_Pincer.md",
    "Chap_29_Asia_The_Distraction.md",
    "Chap_30_Asia_Scorched_Earth.md",
    "Chap_31_Global_Link_Restored.md",
    "Chap_32_Global_The_Witness.md",
    "Chap_33_Global_The_Verdict.md",
    "Chap_34_Global_Brave_New_World.md",
]


def main() -> None:
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with output_file.open("w", encoding="utf-8", newline="\n") as outfile:
        outfile.write("# Blind Orbit\n\n")
        outfile.write("## Draft Complete v1\n\n")
        outfile.write("---\n\n")

        for filename in files:
            filepath = chapters_dir / filename
            if not filepath.exists():
                print(f"Warning: {filename} not found.")
                outfile.write(f"\n\n> [MISSING FILE: {filename}]\n\n")
                continue

            safe_filename = filename.encode("ascii", "backslashreplace").decode("ascii")
            print(f"Adding {safe_filename}...")
            outfile.write(filepath.read_text(encoding="utf-8"))
            outfile.write("\n\n---\n\n")

    print(f"Successfully compiled manuscript to {output_file}")


if __name__ == "__main__":
    main()
