using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace EMarket.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class ApiControllerBase : ControllerBase
    {
        protected string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
