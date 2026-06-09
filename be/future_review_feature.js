/**
 * TÍNH NĂNG ĐÁNH GIÁ/REVIEW ĐỒ CHƠI - BACKEND
 * 
 * Tập tin này dùng để hướng dẫn phát triển chức năng review/nhận xét đồ chơi cho dự án tương lai.
 * KHÔNG thay đổi logic cũ.
 * 
 * BƯỚC 1: Sửa/Thêm Model
 * - Có 2 cách tiếp cận: Thêm mảng `reviews` thẳng vào model Toy HOẶC tạo hẳn model `Review` riêng (Khuyên dùng cách 2).
 * - Nếu tạo file `models/Review.model.js`:
 *   const reviewSchema = new mongoose.Schema({
 *      toyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Toy', required: true },
 *      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 *      rating: { type: Number, required: true, min: 1, max: 5 },
 *      content: { type: String, required: true },
 *   }, { timestamps: true });
 * 
 * BƯỚC 2: Thêm Middleware kiểm tra
 * - Middleware `verifyToken`: để bắt buộc user phải đăng nhập mới được đánh giá.
 * - Middleware `checkPurchased`: (tùy chọn) kiểm tra user đã thuê/mua món đồ chơi đó chưa mới được cho phép review.
 * 
 * BƯỚC 3: Cấu hình Router (Tạo/Cập nhật `routes/review.route.js`)
 * - Cần các API chính sau:
 *   - POST /api/reviews : Thêm đánh giá mới
 *   - GET /api/toys/:toyId/reviews : Lấy toàn bộ đánh giá của 1 đồ chơi
 * 
 * BƯỚC 4: Logic Controller (Tạo `controllers/review.controller.js`)
 */

// Hàm nháp cho Review Controller:
const reviewController = {
  // 1. Tạo mới một đánh giá (Review)
  createReview: async (req, res) => {
    try {
      // Dữ liệu từ user:
      // const { toyId, rating, content } = req.body;
      // const userId = req.user.id; // Lấy từ verifyToken middleware

      // Logic thêm vào database:
      // const newReview = new Review({ toyId, userId, rating, content });
      // await newReview.save();
      //
      // (* Có thể kích hoạt logic cập nhật lại Điểm đánh giá trung bình trong model Toy nếu cần)
      // return res.status(201).json({ message: 'Tạo đánh giá thành công', review: newReview });
    } catch (error) {
      // return res.status(500).json({ error: 'Server bị lỗi khi lưu review' });
    }
  },

  // 2. Lấy các review của 1 đồ chơi cụ thể
  getReviewsByToy: async (req, res) => {
    try {
      // const { toyId } = req.params;
      // const reviews = await Review.find({ toyId }).populate('userId', 'name avatar');
      // return res.status(200).json({ reviews });
    } catch (error) {
      // return res.status(500).json({ error: 'Không thể tải nhận xét' });
    }
  }
};
