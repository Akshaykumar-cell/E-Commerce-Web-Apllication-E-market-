using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EMarket.Application.DTOs.Order;
using EMarket.Application.Interfaces;

namespace EMarket.Api.Controllers
{
    [Authorize]
    public class OrdersController : ApiControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized();
            }

            var order = await _orderService.CreateOrderAsync(CurrentUserId, dto);
            if (order == null)
            {
                return BadRequest(new { message = "Failed to create order. Your cart may be empty." });
            }

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized();
            }

            var orders = await _orderService.GetCustomerOrdersAsync(CurrentUserId);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized();
            }

            var isAdmin = User.IsInRole("Admin");
            var order = await _orderService.GetOrderByIdAsync(id, CurrentUserId, isAdmin);
            if (order == null)
            {
                return NotFound(new { message = $"Order with ID {id} was not found." });
            }

            return Ok(order);
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized();
            }

            var isAdmin = User.IsInRole("Admin");
            var order = await _orderService.GetOrderByIdAsync(id, CurrentUserId, isAdmin);
            if (order == null)
            {
                return NotFound(new { message = $"Order with ID {id} was not found." });
            }

            if (!isAdmin && !order.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase) && 
                !order.Status.Equals("Processing", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "You can only cancel orders that are still pending or processing." });
            }

            var updatedOrder = await _orderService.UpdateOrderStatusAsync(id, Domain.Enums.OrderStatus.Cancelled);
            if (updatedOrder == null)
            {
                return BadRequest(new { message = "Failed to cancel order." });
            }

            return Ok(updatedOrder);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _orderService.UpdateOrderStatusAsync(id, dto.Status);
            if (order == null)
            {
                return NotFound(new { message = $"Order with ID {id} was not found." });
            }

            return Ok(order);
        }
    }
}
