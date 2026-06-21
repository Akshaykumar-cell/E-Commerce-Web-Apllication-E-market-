using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EMarket.Application.DTOs.Cart;
using EMarket.Application.Interfaces;

namespace EMarket.Api.Controllers
{
    [Authorize]
    public class CartController : ApiControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.GetOrCreateCartAsync(CurrentUserId);
            return Ok(cart);
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.AddToCartAsync(CurrentUserId, dto);
            return Ok(cart);
        }

        [HttpPut("items/{productId}")]
        public async Task<IActionResult> UpdateCartItem(int productId, [FromBody] UpdateCartItemDto dto)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.UpdateCartItemAsync(CurrentUserId, productId, dto);
            return Ok(cart);
        }

        [HttpDelete("items/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.RemoveFromCartAsync(CurrentUserId, productId);
            return Ok(cart);
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized();
            }

            var succeeded = await _cartService.ClearCartAsync(CurrentUserId);
            return Ok(new { message = "Cart cleared successfully.", succeeded });
        }
    }
}
