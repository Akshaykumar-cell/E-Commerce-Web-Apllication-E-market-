using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EMarket.Application.DTOs.Category;
using EMarket.Application.Interfaces;

namespace EMarket.Api.Controllers
{
    public class CategoriesController : ApiControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly IValidator<CreateCategoryDto> _createCategoryValidator;

        public CategoriesController(
            ICategoryService categoryService,
            IValidator<CreateCategoryDto> createCategoryValidator)
        {
            _categoryService = categoryService;
            _createCategoryValidator = createCategoryValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);
            if (category == null)
            {
                return NotFound(new { message = $"Category with ID {id} was not found." });
            }
            return Ok(category);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            var validationResult = await _createCategoryValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var category = await _categoryService.CreateCategoryAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto)
        {
            var updatedCategory = await _categoryService.UpdateCategoryAsync(id, dto);
            if (updatedCategory == null)
            {
                return NotFound(new { message = $"Category with ID {id} was not found." });
            }
            return Ok(updatedCategory);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var succeeded = await _categoryService.DeleteCategoryAsync(id);
            if (!succeeded)
            {
                return NotFound(new { message = $"Category with ID {id} was not found. Note: Make sure no products belong to this category first." });
            }
            return Ok(new { message = "Category deleted successfully." });
        }
    }
}
