# Order Tracking Wireframes

## 1. Order History Page (Mobile)

```
┌─────────────────────────────────┐
│ ┌─┐ Lịch sử đơn hàng           │ Header (Orange #ff7043)
│ │←│                            │
└─┴─────────────────────────────────┘
┌─────────────────────────────────┐
│ ┌──────┐┌──────┐┌──────┐┌─────┐│ Filter Tabs
│ │ Tất  ││Đang  ││Hoàn  ││ Đã  ││
│ │ cả   ││xử lý ││thành ││ hủy ││
│ └──────┘└──────┘└──────┘└─────┘│
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ ┌──┐ Pizza Hut          ┌─────┐│ Order Card
│ │🍕│ DH002 • 14:15       │Đang ││
│ └──┘ 4 Jun 2025          │giao ││
│     Pizza Margherita x1  └─────┘│
│     Coca Cola x2         450K₫ │
│     +1 món khác    Xem chi tiết→│
├─────────────────────────────────┤
│ ┌──┐ Nhà hàng Phố Huế   ┌─────┐│ Order Card
│ │🍜│ DH001 • 10:30       │Hoàn ││
│ └──┘ 4 Jun 2025          │thành││
│     Bún bò Huế x2        └─────┘│
│     Chả cá Thăng Long x1  285K₫ │
│     +1 món khác    Xem chi tiết→│
├─────────────────────────────────┤
│ ┌──┐ KFC Vietnam        ┌─────┐│
│ │🍗│ DH003 • 19:45       │Đang ││
│ └──┘ 3 Jun 2025          │chuẩn││
│     Gà rán phần x1       │bị   ││
│     Khoai tây chiên x1   └─────┘│
│     +1 món khác          195K₫ │
│     3 món • 3 sản phẩm   →     │
└─────────────────────────────────┘
```

## 2. Order Tracking Detail Page (Mobile)

```
┌─────────────────────────────────┐
│ ┌─┐ Chi tiết đơn hàng           │ Header
│ │←│ Mã đơn: DH002               │
└─┴─────────────────────────────────┘
┌─────────────────────────────────┐
│           🚚                    │ Status Card (Featured)
│       Đang giao                 │
│   ┌─────────────────────────┐   │
│   │  Còn khoảng 15 phút     │   │ Estimation Badge
│   └─────────────────────────┘   │
│                                 │
│ ┌─────────────────────────────┐ │ Driver Info
│ │ Tài xế: Trần Văn B          │ │
│ │ Honda Wave - 29B1-12345     │ │
│ │ ⭐ 4.8/5      [📞 Gọi tài xế]│ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Tiến trình đơn hàng             │ Timeline Section
│                                 │
│ ● Chờ xác nhận        ✓ 14:15   │ Completed
│ │                               │
│ ● Đã xác nhận         ✓ 14:18   │ Completed
│ │                               │
│ ● Đang chuẩn bị       ✓ 14:20   │ Completed
│ │                               │
│ ● Sẵn sàng giao       ✓ 14:50   │ Completed
│ │                               │
│ ◉ Đang giao           ● 15:00   │ Current (Animated)
│ │                               │
│ ○ Hoàn thành                    │ Pending
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Thông tin nhà hàng              │ Restaurant Info
│ ┌──┐ Pizza Hut                  │
│ │🍕│ 📍 123 Đường Nguyễn Văn Linh│
│ └──┘ 📞 0901234567              │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Chi tiết đơn hàng               │ Order Items
│                                 │
│ ┌──┐ Pizza Margherita size L     │
│ │🍕│ Số lượng: 1        299K₫   │
│ └──┘ Ghi chú: Không hành tây    │
│ ─────────────────────────────── │
│ ┌──┐ Coca Cola                  │
│ │🥤│ Số lượng: 2         50K₫   │
│ └──┘ 25K₫ × 2                  │
│ ─────────────────────────────── │
│ ┌──┐ Chicken Wings              │
│ │🍗│ Số lượng: 1         89K₫   │
│ └──┘ Ghi chú: Cay vừa          │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Thông tin giao hàng             │ Delivery Info
│                                 │
│ Địa chỉ giao hàng:              │
│ Nguyễn Văn A                    │
│ 456 Đường Lê Văn Việt, Q9      │
│ 📞 0987654321                   │
│                                 │
│ Phương thức thanh toán:         │
│ Tiền mặt                        │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ Tổng kết đơn hàng               │ Order Summary
│                                 │
│ Tạm tính              438K₫     │
│ Phí giao hàng          25K₫     │
│ Giảm giá              -50K₫     │
│ ─────────────────────────────── │
│ Tổng cộng             425K₫     │
│                                 │
│    Đặt lúc: 04/06/2025 14:15    │
└─────────────────────────────────┘
```

## 3. Order History Page (Desktop/Tablet)

```
┌───────────────────────────────────────────────────────────────────┐
│ ┌─┐ Lịch sử đơn hàng                                              │
│ │←│                                                               │
└─┴───────────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────────┐
│ ┌────────┐┌────────┐┌────────┐┌────────┐                          │
│ │ Tất cả ││Đang xử ││ Hoàn   ││  Đã    │                          │
│ │        ││  lý    ││ thành  ││ hủy    │                          │
│ └────────┘└────────┘└────────┘└────────┘                          │
└───────────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────────┐
│ ┌──┐ Pizza Hut                           ┌────────┐      450,000₫ │
│ │🍕│ DH002 • 04/06/2025 14:15             │ Đang   │               │
│ └──┘                                      │ giao   │               │
│     ┌─────────────────┐┌─────────────────┐└────────┘               │
│     │Pizza Margherita ││   Coca Cola x2  │                        │
│     │      x1         ││                 │                        │
│     └─────────────────┘└─────────────────┘                        │
│     3 món • 4 sản phẩm                          Xem chi tiết →    │
├───────────────────────────────────────────────────────────────────┤
│ ┌──┐ Nhà hàng Phố Huế                    ┌────────┐      285,000₫ │
│ │🍜│ DH001 • 04/06/2025 10:30             │ Hoàn   │               │
│ └──┘                                      │ thành  │               │
│     ┌─────────────────┐┌─────────────────┐└────────┘               │
│     │  Bún bò Huế x2  ││ Chả cá Thăng    │                        │
│     │                 ││    Long x1      │                        │
│     └─────────────────┘└─────────────────┘                        │
│     3 món • 5 sản phẩm                          Xem chi tiết →    │
└───────────────────────────────────────────────────────────────────┘
```

## 4. Timeline Component Detail

```
Timeline States Visualization:

Completed Step:
● ──── ✓ 14:15
│      Chờ xác nhận
│      Đơn hàng đã được đặt thành công

Current Step (Animated):
◉ ──── ● 15:00  <- Pulse animation
│      Đang giao
│      Shipper đang trên đường giao đến bạn

Pending Step:
○ ────
│      Hoàn thành
│      Đơn hàng đã được giao thành công

Line Colors:
│ Green (#66bb6a) - Completed
│ Orange (#ff7043) - Current
│ Gray (#e0e0e0) - Pending
```

## 5. Empty States

```
No Orders State:
┌─────────────────────────────────┐
│                                 │
│           🍽️                   │
│                                 │
│     Không có đơn hàng nào       │
│                                 │
│   Hãy đặt món đầu tiên của bạn! │
│                                 │
│     [  Khám phá món ăn  ]       │
│                                 │
└─────────────────────────────────┘

Loading State:
┌─────────────────────────────────┐
│                                 │
│           ⟳                     │
│                                 │
│   Đang tải thông tin đơn hàng...│
│                                 │
└─────────────────────────────────┘

Error State:
┌─────────────────────────────────┐
│                                 │
│           ⚠️                    │
│                                 │
│    Không thể tải đơn hàng       │
│                                 │
│       [  Thử lại  ]             │
│                                 │
└─────────────────────────────────┘
```

## 6. Interaction States

```
Card Hover (Desktop):
┌─────────────────────────────────┐ ← Shadow depth increases
│ ┌──┐ Pizza Hut          ↗       │ ← Border color changes
│ │🍕│ DH002 • 14:15       Đang   │ ← Slight upward movement
│ └──┘ 4 Jun 2025          giao   │
│     Pizza details...     450K₫  │
└─────────────────────────────────┘

Button States:
Normal:    [ Đơn hàng của tôi ]
Hover:     [ Đơn hàng của tôi ] ← Darker background
Pressed:   [ Đơn hàng của tôi ] ← Slight scale down
Disabled:  [ Đơn hàng của tôi ] ← Grayed out

Filter Tab States:
Active:    ┌──────┐ ← Orange background
           │ Tất  │
           │ cả   │
           └──────┘

Inactive:  ┌──────┐ ← White background, gray border
           │Đang  │
           │xử lý │
           └──────┘
```

## Color Reference

```
Primary Colors:
#ff7043 - Main orange (headers, CTAs, active states)
#f4511e - Darker orange (hover states)
#ffccbc - Light orange (borders, highlights)

Status Colors:
#ffa726 - Pending (amber)
#42a5f5 - Preparing (blue)  
#ab47bc - Delivering (purple)
#66bb6a - Completed (green)
#ef5350 - Cancelled (red)

Neutral Colors:
#333 - Primary text
#666 - Secondary text
#999 - Tertiary text
#f5f5f5 - Light background
#e0e0e0 - Borders, dividers
```

## Typography Scale

```
Heading 1: 1.8rem (28.8px) - Page titles
Heading 2: 1.5rem (24px) - Section titles  
Heading 3: 1.3rem (20.8px) - Card titles
Heading 4: 1.1rem (17.6px) - Item titles
Body: 1rem (16px) - Regular text
Small: 0.9rem (14.4px) - Secondary info
Tiny: 0.8rem (12.8px) - Tags, labels
```
