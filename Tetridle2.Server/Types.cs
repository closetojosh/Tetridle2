namespace Tetridle2.Server
{
    using System.Collections.Generic;

    public class Clear
    {
        public int Lines { get; set; } // 1, 2, 3, or 4
        public bool IsTSpin { get; set; }
        public bool IsPerfectClear { get; set; }
    }

    public class Mission
    {
        public required List<List<char?>> StartingPosition { get; set; }
        public required List<Clear> Clears { get; set; }
        public required List<char> Pieces { get; set; }
    }
}
