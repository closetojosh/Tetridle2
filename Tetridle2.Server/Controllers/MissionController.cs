using Microsoft.AspNetCore.Mvc;

namespace Tetridle2.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MissionController : ControllerBase
    {
        [HttpGet(Name = "GetMission")]
        public Mission Get()
        {
            Mission m = new Mission
            {
                //Starting position should be 20x10, filled with nulls
                StartingPosition = new List<List<char?>>
                {
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, null, null, null, null, null, null, null },
                    new List<char?> { null, null, null, 'I' , null, 'O' , null, null, null, null },
                },
                Clears = new List<Clear>
                {
                    new Clear
                    {
                        Lines = 1,
                        IsTSpin = false,
                        IsPerfectClear = false
                    }
                },
                Pieces = new List<char> { 'T', 'J', 'L' }
            };
            return m;
        }
    }
}
