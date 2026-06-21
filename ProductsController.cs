using System;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EMarket.Application.DTOs.Product;
using EMarket.Application.DTOs.Review;
using EMarket.Application.Interfaces;

namespace EMarket.Api.Controllers
{
    public class ProductsController : ApiControllerBase
    {
        private readonly IProductService _productService;
        private readonly IValidator<CreateProductDto> _createProductValidator;

        public ProductsController(
            IProductService productService,
            IValidator<CreateProductDto> createProductValidator)
        {
            _productService = productService;
            _createProductValidator = createProductValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sortBy)
        {
            var products = await _productService.GetAllProductsAsync(search, categoryId, minPrice, maxPrice, sortBy);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = $"Product with ID {id} was not found." });
            }
            return Ok(product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            var validationResult = await _createProductValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var product = await _productService.CreateProductAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
        {
            var updatedProduct = await _productService.UpdateProductAsync(id, dto);
            if (updatedProduct == null)
            {
                return NotFound(new { message = $"Product with ID {id} was not found." });
            }
            return Ok(updatedProduct);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var succeeded = await _productService.DeleteProductAsync(id);
            if (!succeeded)
            {
                return NotFound(new { message = $"Product with ID {id} was not found." });
            }
            return Ok(new { message = "Product deleted successfully." });
        }

        [Authorize]
        [HttpPost("{id}/reviews")]
        public async Task<IActionResult> AddReview(int id, [FromBody] CreateReviewDto dto)
        {
            if (string.IsNullOrEmpty(CurrentUserId))
            {
                return Unauthorized();
            }

            // Expose the customer's email or Name from JWT claims. We use the claims:
            var userName = User.FindFirst("firstName")?.Value + " " + User.FindFirst("lastName")?.Value;
            if (string.IsNullOrWhiteSpace(userName))
            {
                userName = User.Identity?.Name ?? "Customer";
            }

            var review = await _productService.AddProductReviewAsync(id, CurrentUserId, userName, dto);
            if (review == null)
            {
                return NotFound(new { message = $"Product with ID {id} was not found." });
            }

            return Ok(review);
        }
    }
}
