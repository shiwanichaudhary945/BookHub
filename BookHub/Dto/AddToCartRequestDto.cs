namespace BookHub.Dto
{
    public class AddToCartRequestDto
    {
        public long BookId { get; set; }
        public int Quantity { get; set; }
    }
}
