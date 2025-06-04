# Định nghĩa Trạng thái Đơn hàng - Ứng dụng Giao Đồ Ăn

## Tổng quan
Tài liệu này định nghĩa chi tiết các trạng thái xử lý đơn hàng trong hệ thống giao đồ ăn, bao quát toàn bộ vòng đời của một đơn hàng từ lúc đặt hàng đến khi hoàn tất hoặc hủy.

## Danh sách Trạng thái

### 1. PENDING (Chờ xác nhận)
**Tên trạng thái:** `pending` - "Chờ xác nhận"

**Mô tả:** Đơn hàng vừa được tạo bởi khách hàng và đang chờ nhà hàng xác nhận.

**Điều kiện kích hoạt:**
- Khách hàng hoàn tất việc đặt hàng và thanh toán thành công
- Đây là trạng thái mặc định khi đơn hàng mới được tạo

**Hành động tiếp theo có thể có:**
- `confirmed` (Nhà hàng chấp nhận đơn hàng)
- `cancelled` (Nhà hàng từ chối hoặc khách hàng hủy đơn)

**Thông tin hiển thị cho người dùng:**
- "Đơn hàng của bạn đang chờ nhà hàng xác nhận"
- "Thời gian dự kiến xác nhận: 5-10 phút"
- Hiển thị thông tin đơn hàng chi tiết

**Thông tin cho quản trị viên/nhà hàng:**
- Thông báo đơn hàng mới cần xử lý
- Hiển thị thông tin khách hàng và chi tiết đơn hàng
- Nút "Chấp nhận" / "Từ chối" đơn hàng

---

### 2. CONFIRMED (Đã xác nhận)
**Tên trạng thái:** `confirmed` - "Đã xác nhận"

**Điều kiện kích hoạt:**
- Nhà hàng chấp nhận đơn hàng từ trạng thái `pending`

**Hành động tiếp theo có thể có:**
- `preparing` (Nhà hàng bắt đầu chuẩn bị món)
- `cancelled` (Hủy do lý do bất khả kháng)

**Thông tin hiển thị cho người dùng:**
- "Nhà hàng đã xác nhận đơn hàng của bạn"
- "Đơn hàng sẽ được chuẩn bị sớm"

**Thông tin cho quản trị viên/nhà hàng:**
- Đơn hàng đã được xác nhận, cần chuyển sang chuẩn bị
- Thời gian xác nhận được ghi lại

---

### 3. PREPARING (Đang chuẩn bị)
**Tên trạng thái:** `preparing` - "Đang chuẩn bị"

**Mô tả:** Nhà hàng đang tiến hành chuẩn bị các món ăn trong đơn hàng.

**Điều kiện kích hoạt:**
- Nhà hàng bắt đầu chế biến món ăn từ trạng thái `confirmed`

**Hành động tiếp theo có thể có:**
- `ready_for_pickup` (Món ăn đã sẵn sàng để lấy)
- `cancelled` (Hủy do hết nguyên liệu hoặc lý do khác)

**Thông tin hiển thị cho người dùng:**
- "Nhà hàng đang chuẩn bị món ăn của bạn"
- "Thời gian chuẩn bị dự kiến: 15-25 phút"
- Thanh tiến trình hiển thị % hoàn thành

**Thông tin cho quản trị viên/nhà hàng:**
- Danh sách món cần chuẩn bị
- Thời gian bắt đầu chuẩn bị
- Nút "Hoàn thành chuẩn bị"

---

### 4. READY_FOR_PICKUP (Sẵn sàng lấy hàng)
**Tên trạng thái:** `ready_for_pickup` - "Sẵn sàng lấy hàng"

**Mô tả:** Món ăn đã được chuẩn bị xong và sẵn sàng để tài xế đến lấy.

**Điều kiện kích hoạt:**
- Nhà hàng hoàn tất việc chuẩn bị món ăn từ trạng thái `preparing`

**Hành động tiếp theo có thể có:**
- `picked_up` (Tài xế đã lấy hàng)
- `cancelled` (Hủy do không có tài xế hoặc lý do khác)

**Thông tin hiển thị cho người dùng:**
- "Món ăn đã sẵn sàng, đang tìm tài xế giao hàng"
- "Thời gian dự kiến có tài xế: 5-10 phút"

**Thông tin cho quản trị viên/nhà hàng:**
- Đơn hàng sẵn sàng giao cho tài xế
- Thông tin đóng gói và ghi chú đặc biệt

---

### 5. PICKED_UP (Đã lấy hàng)
**Tên trạng thái:** `picked_up` - "Đã lấy hàng"

**Mô tả:** Tài xế đã lấy hàng từ nhà hàng và chuẩn bị giao cho khách hàng.

**Điều kiện kích hoạt:**
- Tài xế xác nhận đã lấy hàng từ nhà hàng từ trạng thái `ready_for_pickup`

**Hành động tiếp theo có thể có:**
- `delivering` (Tài xế đang trên đường giao hàng)

**Thông tin hiển thị cho người dùng:**
- "Tài xế đã lấy hàng và đang chuẩn bị giao cho bạn"
- Thông tin tài xế (tên, số điện thoại, biển số xe)

**Thông tin cho quản trị viên/nhà hàng:**
- Thông tin tài xế đã lấy hàng
- Thời gian lấy hàng

---

### 6. DELIVERING (Đang giao hàng)
**Tên trạng thái:** `delivering` - "Đang giao hàng"

**Mô tả:** Tài xế đang trên đường giao hàng đến địa chỉ của khách hàng.

**Điều kiện kích hoạt:**
- Tài xế bắt đầu hành trình giao hàng từ trạng thái `picked_up`

**Hành động tiếp theo có thể có:**
- `delivered` (Giao hàng thành công)
- `delivery_failed` (Giao hàng thất bại)
- `returning` (Đang trả hàng về nhà hàng)

**Thông tin hiển thị cho người dùng:**
- "Tài xế đang trên đường giao hàng"
- Bản đồ theo dõi vị trí tài xế (real-time)
- "Thời gian dự kiến giao hàng: 15-20 phút"
- Thông tin liên hệ tài xế

**Thông tin cho quản trị viên/nhà hàng:**
- Trạng thái giao hàng real-time
- Thông tin tài xế và tiến trình giao hàng

---

### 7. DELIVERED (Đã giao hàng)
**Tên trạng thái:** `delivered` - "Đã giao hàng"

**Mô tả:** Đơn hàng đã được giao thành công đến khách hàng.

**Điều kiện kích hoạt:**
- Tài xế xác nhận đã giao hàng thành công từ trạng thái `delivering`
- Khách hàng xác nhận đã nhận hàng

**Hành động tiếp theo có thể có:**
- `completed` (Hoàn tất đơn hàng sau khi khách hàng đánh giá)

**Thông tin hiển thị cho người dùng:**
- "Đơn hàng đã được giao thành công"
- "Hãy đánh giá trải nghiệm của bạn"
- Form đánh giá nhà hàng và tài xế

**Thông tin cho quản trị viên/nhà hàng:**
- Xác nhận giao hàng thành công
- Thời gian hoàn tất giao hàng

---

### 8. COMPLETED (Hoàn thành)
**Tên trạng thái:** `completed` - "Hoàn thành"

**Mô tả:** Đơn hàng đã hoàn tất toàn bộ quy trình, bao gồm việc khách hàng đánh giá.

**Điều kiện kích hoạt:**
- Khách hàng đã đánh giá đơn hàng từ trạng thái `delivered`
- Hoặc tự động chuyển sau 24h nếu không có đánh giá

**Hành động tiếp theo có thể có:**
- Không có (trạng thái cuối)

**Thông tin hiển thị cho người dùng:**
- "Cảm ơn bạn đã sử dụng dịch vụ"
- "Đặt lại món yêu thích"
- Lịch sử đơn hàng hoàn tất

**Thông tin cho quản trị viên/nhà hàng:**
- Đơn hàng hoàn tất
- Doanh thu được ghi nhận
- Đánh giá của khách hàng

---

### 9. CANCELLED (Đã hủy)
**Tên trạng thái:** `cancelled` - "Đã hủy"

**Mô tả:** Đơn hàng đã bị hủy bởi khách hàng, nhà hàng hoặc hệ thống.

**Điều kiện kích hoạt:**
- Khách hàng hủy đơn (trong thời gian cho phép)
- Nhà hàng từ chối đơn hàng
- Hệ thống tự động hủy (quá thời gian xử lý)
- Không tìm được tài xế sau thời gian quy định

**Hành động tiếp theo có thể có:**
- Không có (trạng thái cuối)

**Thông tin hiển thị cho người dùng:**
- "Đơn hàng đã bị hủy"
- Lý do hủy đơn
- Thông tin hoàn tiền (nếu có)
- "Đặt lại đơn hàng"

**Thông tin cho quản trị viên/nhà hàng:**
- Lý do hủy đơn
- Xử lý hoàn tiền
- Thống kê tỷ lệ hủy đơn

---

### 10. DELIVERY_FAILED (Giao hàng thất bại)
**Tên trạng thái:** `delivery_failed` - "Giao hàng thất bại"

**Mô tả:** Tài xế không thể giao hàng thành công do các lý do khách quan.

**Điều kiện kích hoạt:**
- Khách hàng không có mặt tại địa chỉ giao hàng
- Địa chỉ giao hàng không chính xác
- Khách hàng từ chối nhận hàng
- Các lý do bất khả kháng khác

**Hành động tiếp theo có thể có:**
- `returning` (Trả hàng về nhà hàng)
- `cancelled` (Hủy đơn nếu không thể xử lý)

**Thông tin hiển thị cho người dùng:**
- "Giao hàng thất bại"
- Lý do cụ thể
- "Vui lòng liên hệ hỗ trợ khách hàng"
- Tùy chọn đặt lại hoặc đổi địa chỉ

**Thông tin cho quản trị viên/nhà hàng:**
- Chi tiết lý do giao hàng thất bại
- Cần xử lý hoàn tiền/đổi trả

---

### 11. RETURNING (Đang trả hàng)
**Tên trạng thái:** `returning` - "Đang trả hàng"

**Mô tả:** Tài xế đang trả hàng về nhà hàng do giao hàng thất bại.

**Điều kiện kích hoạt:**
- Chuyển từ trạng thái `delivery_failed`
- Tài xế quyết định trả hàng về nhà hàng

**Hành động tiếp theo có thể có:**
- `returned` (Đã trả hàng về nhà hàng)
- `cancelled` (Hủy đơn)

**Thông tin hiển thị cho người dùng:**
- "Đơn hàng đang được trả về nhà hàng"
- "Chúng tôi sẽ liên hệ để xử lý"

**Thông tin cho quản trị viên/nhà hàng:**
- Tài xế đang trả hàng về
- Chuẩn bị xử lý hoàn tiền

---

### 12. RETURNED (Đã trả hàng)
**Tên trạng thái:** `returned` - "Đã trả hàng"

**Mô tả:** Hàng đã được trả về nhà hàng thành công.

**Điều kiện kích hoạt:**
- Tài xế đã trả hàng về nhà hàng từ trạng thái `returning`

**Hành động tiếp theo có thể có:**
- `refunded` (Đã hoàn tiền)

**Thông tin hiển thị cho người dùng:**
- "Đơn hàng đã được trả về nhà hàng"
- "Chúng tôi sẽ hoàn tiền trong 1-3 ngày làm việc"

**Thông tin cho quản trị viên/nhà hàng:**
- Hàng đã được trả về
- Cần xử lý hoàn tiền cho khách hàng

---

### 13. REFUNDED (Đã hoàn tiền)
**Tên trạng thái:** `refunded` - "Đã hoàn tiền"

**Mô tả:** Tiền đã được hoàn trả cho khách hàng.

**Điều kiện kích hoạt:**
- Hoàn tiền đã được xử lý từ trạng thái `returned` hoặc `cancelled`

**Hành động tiếp theo có thể có:**
- Không có (trạng thái cuối)

**Thông tin hiển thị cho người dùng:**
- "Đã hoàn tiền thành công"
- Chi tiết số tiền và phương thức hoàn tiền
- "Cảm ơn bạn đã thông cảm"

**Thông tin cho quản trị viên/nhà hàng:**
- Xác nhận đã hoàn tiền
- Ghi nhận trong báo cáo tài chính

---

## Sơ đồ Luồng Chuyển Đổi Trạng thái

```
[PENDING] 
    ↓ (Nhà hàng xác nhận)
[CONFIRMED]
    ↓ (Bắt đầu chuẩn bị)
[PREPARING]
    ↓ (Hoàn thành chuẩn bị)
[READY_FOR_PICKUP]
    ↓ (Tài xế lấy hàng)
[PICKED_UP]
    ↓ (Bắt đầu giao hàng)
[DELIVERING]
    ↓ (Giao thành công)          ↓ (Giao thất bại)
[DELIVERED]                    [DELIVERY_FAILED]
    ↓ (Khách đánh giá)            ↓ (Trả hàng)
[COMPLETED]                    [RETURNING]
                                 ↓ (Trả về thành công)
                               [RETURNED]
                                 ↓ (Hoàn tiền)
                               [REFUNDED]

--- Các luồng hủy đơn ---
[PENDING/CONFIRMED/PREPARING] → [CANCELLED] → [REFUNDED]
```

## Thời gian Timeout cho từng Trạng thái

| Trạng thái | Thời gian tối đa | Hành động khi timeout |
|------------|------------------|----------------------|
| PENDING | 15 phút | Tự động hủy |
| CONFIRMED | 5 phút | Tự động chuyển sang PREPARING |
| PREPARING | 45 phút | Thông báo chậm trễ |
| READY_FOR_PICKUP | 30 phút | Tìm tài xế khác |
| PICKED_UP | 10 phút | Tự động chuyển sang DELIVERING |
| DELIVERING | 60 phút | Thông báo chậm trễ |

## Quyền Hạn Thay Đổi Trạng thái

| Vai trò | Quyền thay đổi trạng thái |
|---------|---------------------------|
| Khách hàng | PENDING → CANCELLED |
| Nhà hàng | PENDING → CONFIRMED/CANCELLED, CONFIRMED → PREPARING, PREPARING → READY_FOR_PICKUP |
| Tài xế | READY_FOR_PICKUP → PICKED_UP, PICKED_UP → DELIVERING, DELIVERING → DELIVERED/DELIVERY_FAILED |
| Hệ thống | Tự động timeout, DELIVERED → COMPLETED, RETURNED → REFUNDED |
| Admin | Tất cả (trong trường hợp đặc biệt) |

## Thông báo Real-time

Mỗi khi trạng thái thay đổi, hệ thống sẽ gửi thông báo đến:
- **Khách hàng**: Push notification, SMS, Email
- **Nhà hàng**: Dashboard notification, Email
- **Tài xế**: App notification
- **Admin**: Dashboard monitoring

## Lưu ý Triển khai

1. **Database**: Lưu trữ lịch sử thay đổi trạng thái với timestamp và người thực hiện
2. **API**: Cung cấp endpoint để thay đổi trạng thái với validation
3. **UI/UX**: Hiển thị trạng thái với màu sắc và icon phù hợp
4. **Monitoring**: Theo dõi thời gian xử lý mỗi trạng thái để tối ưu hóa
5. **Business Logic**: Xử lý các trường hợp đặc biệt và exception handling

---

*Tài liệu này cần được review và cập nhật định kỳ theo yêu cầu business và feedback từ người dùng.*
