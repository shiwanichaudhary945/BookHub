using System.ComponentModel.DataAnnotations;

namespace BookHub.Dto
{
    public class StaffRegistrationDto
    {
        [Required]
        public string FullName { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PhoneNumber { get; set; }
    }
}
