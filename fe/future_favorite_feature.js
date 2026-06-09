/**
 * TÍNH NĂNG YÊU THÍCH SẢN PHẨM (FAVORITE TOYS) - FRONTEND
 * 
 * Đây là tệp hướng dẫn phát triển tính năng trong tương lai. Chỉ chứa comment hướng dẫn và code nháp.
 * KHÔNG thay đổi logic cũ.
 * 
 * BƯỚC 1: Sửa file Giao diện (Ví dụ: `screens/ToyDetailScreen.js` và tạo màn mới `screens/FavoriteToysScreen.js`)
 * - Trong màn Detail của một đồ chơi, thêm một nút "Trái tim" đại diện cho nút Yêu thích.
 * - Khi click vào trái tim, gọi hàm handleToggleFavorite.
 * - Ở Menu/Tab navigation, thêm một icon dẫn tới màn FavoriteToysScreen để người dùng xem danh sách đang thích.
 * 
 * BƯỚC 2: Quản lý Trạng thái (Thêm state vào Hook hoặc Redux/Context)
 * - Nếu dùng local state ở trang Detail:
 *   const [isFavorite, setIsFavorite] = useState(false);
 * - Hoặc đưa vào global state (Context/Redux) để giữ đồng bộ danh sách yêu thích giữa nhiều màn hình:
 *   const { favoriteToys, addToFavorites, removeFromFavorites } = useToyContext();
 * 
 * BƯỚC 3: Service/API Call (Thêm vào file `services/api.js` hoặc `services/toy.service.js`)
 * - Cần gọi các endpoint backend từ FE:
 *   - api.post('/favorites', { toyId })
 *   - api.delete(`/favorites/${toyId}`)
 *   - api.get('/favorites')
 * 
 * DƯỚI ĐÂY LÀ ĐOẠN CODE NHÁP ĐỂ CHÈN VÀO COMPONENT (KHÔNG CHẠY TRỰC TIẾP Ở ĐÂY, CHỈ MANG TÍNH THAM KHẢO):
 */

// Giả định Component hiển thị Trang chi tiết:
import React, { useState, useEffect } from 'react';
/*
const ToyDetailFavoriteAction = ({ toyId, initialIsFavorite }) => {
    // 1. Khai báo state
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

    // 2. Hàm xử lý khi bấm nút Thích / Bỏ thích
    const handleToggleFavorite = async () => {
        try {
            if (isFavorite) {
                // Gọi service gửi request Xóa yêu thích
                // await api.delete(`/favorites/${toyId}`);
                setIsFavorite(false);
            } else {
                // Gọi service gửi request Thêm yêu thích
                // await api.post('/favorites', { toyId });
                setIsFavorite(true);
            }
        } catch (error) {
            // Xử lý báo lỗi (toast, alert...)
            console.error('Lỗi khi thay đổi trạng thái yêu thích', error);
        }
    };

    return (
        // 3. Giao diện (UI) Nút trái tim gắn vào View 
        <TouchableOpacity onPress={handleToggleFavorite}>
            <Icon 
               name={isFavorite ? "heart" : "heart-outline"} 
               color={isFavorite ? "red" : "gray"} 
            />
        </TouchableOpacity>
    );
};
*/
