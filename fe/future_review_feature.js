/**
 * TÍNH NĂNG ĐÁNH GIÁ/REVIEW ĐỒ CHƠI - FRONTEND
 * 
 * Hướng dẫn tích hợp chức năng cho khách hàng xem và viết đánh giá món đồ chơi.
 * KHÔNG thay đổi logic cũ.
 * 
 * BƯỚC 1: Sửa Layout / UI Component (Ví dụ: `screens/ToyDetailScreen.js`)
 * - Trong màn hình chi tiết đồ chơi, cuộn xuống dưới cùng sẽ hiển thị thêm component `<ReviewsList />`.
 * - Thêm một phần `<WriteReviewForm />` có chứa Rating (dạng số chọ sao 1-5) và TextInput cho nội dung để viết nhận xét.
 * 
 * BƯỚC 2: Thêm State trong Component (Sử dụng Hook)
 * - Cần khai báo các state để nhận dữ liệu từ server và gửi đánh giá lên:
 *   const [reviews, setReviews] = useState([]); // Chứa danh sách đánh giá
 *   const [rating, setRating] = useState(5); // Điểm đánh giá khi gửi đi
 *   const [content, setContent] = useState(""); // Nội dung text
 * 
 * BƯỚC 3: Bổ sung API Services (`services/api.js` hoặc `services/review.service.js`)
 * - Định nghĩa các hàm call API tới hệ thống BE:
 *   - getToyReviews(toyId) => gọi GET `/api/toys/${toyId}/reviews`
 *   - submitToyReview(toyId, rating, content) => gọi POST `/api/reviews`
 * 
 * DƯỚI ĐÂY LÀ CODE NHÁP ĐỂ LÀM THEO (CHỈ CHỨA TRONG 1 FILE, KHÔNG CHẠY THẬT):
 */

// Ví dụ Component React hiển thị Đánh Giá
/*
import React, { useState, useEffect } from 'react';

const ToyReviewSection = ({ toyId }) => {
   // Khởi tạo các state (Theo Bước 2)
   const [reviews, setReviews] = useState([]);
   const [rating, setRating] = useState(5);
   const [content, setContent] = useState("");

   // Hàm lấy dữ liệu load lúc mở màn hình
   useEffect(() => {
       // fetchReviews API method
       // api.get(`/toys/${toyId}/reviews`)
       //    .then(res => setReviews(res.data))
       //    .catch(err => console.error(err));
   }, [toyId]);

   // Hàm Gửi nhận xét
   const handleSubmitReview = async () => {
       // try {
       //    await api.post('/reviews', { toyId, rating, content });
       //    alert("Cảm ơn bạn đã đánh giá!");
       //    // Sau đó gọi lại fetchReviews để làm mới lịch sử hiển thị
       //    setContent(""); // Xóa trắng ô input
       // } catch (e) { console.error('Lỗi khi gửi đánh giá', e); }
   }

   return (
       <View>
           <Text>Danh sách Đánh giá</Text>
           {reviews.map(item => (
               <View key={item._id} style={{ marginVertical: 5 }}>
                   <Text style={{ fontWeight: 'bold' }}>{item.userId?.name}: {item.rating} Sao</Text>
                   <Text>{item.content}</Text>
               </View>
           ))}
           
           <View style={{ marginTop: 20 }}>
               <Text>Viết đánh giá của bạn (Ví dụ giao diện)</Text>
               <TextInput 
                   placeholder="Trải nghiệm của bạn về món đồ chơi này..." 
                   value={content}
                   onChangeText={setContent}
               />
               <Button title="Gửi đánh giá" onPress={handleSubmitReview} />
           </View>
       </View>
   );
}
*/
