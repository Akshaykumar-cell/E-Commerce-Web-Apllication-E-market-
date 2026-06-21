using System;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EMarket.Application.DTOs.Inquiry;
using EMarket.Application.Interfaces;

namespace EMarket.Api.Controllers
{
    public class InquiriesController : ApiControllerBase
    {
        private readonly IInquiryService _inquiryService;
        private readonly IValidator<CreateProductInquiryDto> _createInquiryValidator;

        public InquiriesController(
            IInquiryService inquiryService,
            IValidator<CreateProductInquiryDto> createInquiryValidator)
        {
            _inquiryService = inquiryService;
            _createInquiryValidator = createInquiryValidator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductInquiryDto dto)
        {
            var validationResult = await _createInquiryValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
            }

            var userId = CurrentUserId;
            var inquiry = await _inquiryService.CreateInquiryAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = inquiry.Id }, inquiry);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var inquiries = await _inquiryService.GetAllInquiriesAsync();
            return Ok(inquiries);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var inquiry = await _inquiryService.GetInquiryByIdAsync(id);
            if (inquiry == null)
            {
                return NotFound(new { message = $"Inquiry with ID {id} was not found." });
            }
            return Ok(inquiry);
        }

        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            // If the user is an admin, show all inquiries for this product.
            // Otherwise, show only replied inquiries.
            bool onlyReplied = !User.IsInRole("Admin");
            var inquiries = await _inquiryService.GetInquiriesByProductIdAsync(productId, onlyReplied);
            return Ok(inquiries);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/reply")]
        public async Task<IActionResult> Reply(int id, [FromBody] ReplyProductInquiryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Answer))
            {
                return BadRequest(new { errors = new[] { "Reply answer cannot be empty." } });
            }

            var inquiry = await _inquiryService.ReplyToInquiryAsync(id, dto.Answer);
            if (inquiry == null)
            {
                return NotFound(new { message = $"Inquiry with ID {id} was not found." });
            }

            return Ok(inquiry);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var succeeded = await _inquiryService.DeleteInquiryAsync(id);
            if (!succeeded)
            {
                return NotFound(new { message = $"Inquiry with ID {id} was not found." });
            }

            return Ok(new { message = "Inquiry deleted successfully." });
        }
    }
}
