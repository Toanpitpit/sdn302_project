/**
 * TÍNH NĂNG YÊU THÍCH SẢN PHẨM (FAVORITE TOYS) - BACKEND
 * 
 * Đây là tệp hướng dẫn phát triển tính năng trong tương lai. Chỉ chứa comment hướng dẫn và code nháp.
 * KHÔNG thay đổi logic cũ.
 * 
 * BƯỚC 1: Cập nhật Model (Ví dụ trong file `models/User.model.js`)
 * - Thêm mảng chứa ID của các đồ chơi yêu thích vào schema của User.
 * Đoạn code cần thêm vào schema:
 *   favoriteToys: [{
 *     type: mongoose.Schema.Types.ObjectId,
 *     ref: 'Toy'
 *   }]
 * 
 * BƯỚC 2: Thêm Middleware (nếu cần thiết để xác thực customer)
 * - Sử dụng middleware verifyToken (đã có mã hóa/giải mã token) cho các API ở Bước 3 để đảm bảo chỉ những user đã đăng nhập mới xem/thêm/xóa được đồ chơi yêu thích.
 * 
 * BƯỚC 3: Thêm Route (Trong file `routes/user.route.js` hoặc `routes/toy.route.js`)
 * - Thêm các endpoint API:
 *   router.post('/favorites', verifyToken, addFavoriteToy);
 *   router.delete('/favorites/:toyId', verifyToken, removeFavoriteToy);
 *   router.get('/favorites', verifyToken, getCustomerFavorites);
 * 
 * BƯỚC 4: Tạo Controller Functions (Ví dụ trong `controllers/user.controller.js` hoặc file controller mới)
 */

// Hàm nháp cho Controller (Sẽ ghép vào controller thực tế sau này theo đúng vị trí của hệ thống):
const favoriteToyController = {
  // 1. Thêm đồ chơi vào danh sách yêu thích
  addFavoriteToy: async (req, res) => {
    try {
      // Đầu vào: Toy ID trong req.body và User ID từ req.user (middleware xác thực)
      // Logic:
      // const user = await User.findById(req.user.id);
      // if (!user.favoriteToys.includes(req.body.toyId)) {
      //     user.favoriteToys.push(req.body.toyId);
      //     await user.save();
      // }
      // return res.status(200).json({ message: 'Đã thêm vào yêu thích' });
    } catch (error) {
      // return res.status(500).json({ error: 'Lỗi server' });
    }
  },

  // 2. Lấy danh sách đồ chơi yêu thích của khách hàng
  getCustomerFavorites: async (req, res) => {
    try {
      // Logic:
      // const user = await User.findById(req.user.id).populate('favoriteToys');
      // return res.status(200).json({ data: user.favoriteToys });
    } catch (error) {
      // return res.status(500).json({ error: 'Lỗi server' });
    }
  },

  // 3. Xóa đồ chơi khỏi danh sách yêu thích
  removeFavoriteToy: async (req, res) => {
    try {
      // Logic:
      // const user = await User.findById(req.user.id);
      // user.favoriteToys = user.favoriteToys.filter(id => id.toString() !== req.params.toyId);
      // await user.save();
      // return res.status(200).json({ message: 'Đã bỏ yêu thích' });
    } catch (error) {
      // return res.status(500).json({ error: 'Lỗi server' });
    }
  }
};
