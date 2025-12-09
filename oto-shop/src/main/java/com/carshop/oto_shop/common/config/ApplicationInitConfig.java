package com.carshop.oto_shop.common.config;

import com.carshop.oto_shop.entities.*;
import com.carshop.oto_shop.enums.*;
import com.carshop.oto_shop.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Configuration
public class ApplicationInitConfig {
    private final static Logger log = LoggerFactory.getLogger(ApplicationInitConfig.class);
    private final PasswordEncoder passwordEncoder;

    public ApplicationInitConfig(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    ApplicationRunner initData(AccountRepository accountRepository,
                               UserRepository userRepository,
                               CarRepository carRepository,
                               NewsRepository newsRepository,
                               OrderRepository orderRepository) { // Inject thêm OrderRepository
        return args -> {
            Random random = new Random();

            // ==========================================
            // 1. KHỞI TẠO ADMIN
            // ==========================================
            String defaultAdminEmail = "admin@gmail.com";
            if (!accountRepository.existsByEmail(defaultAdminEmail)) {
                Account adminAccount = new Account();
                adminAccount.setEmail(defaultAdminEmail);
                adminAccount.setPassword(passwordEncoder.encode("admin"));
                adminAccount.setRole(Role.ADMIN);
                adminAccount.setStatus(AccountStatus.ACTIVE);
                accountRepository.save(adminAccount);

                User adminUser = new User();
                adminUser.setAccount(adminAccount);
                adminUser.setFullName("Administrator");
                adminUser.setGender(Gender.MALE);
                adminUser.setPhone("1900123123");
                adminUser.setAddress("Hà Nội, Việt Nam");
                adminUser.setDob(LocalDate.of(1990, 1, 1));
                userRepository.save(adminUser);
                log.warn("Default admin created: " + defaultAdminEmail);
            }

            // ==========================================
            // 2. KHỞI TẠO USER KHÁCH HÀNG (DUMMY USERS) - MỚI
            // ==========================================
            // Cần tạo user giả để đặt đơn hàng
            List<User> dummyUsers = new ArrayList<>();
            if (userRepository.count() < 5) { // Chỉ tạo nếu chưa có nhiều user
                log.info("Seeding dummy customers...");
                String[] lastNames = {"Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"};
                String[] middleNames = {"Văn", "Thị", "Hữu", "Minh", "Quốc", "Thanh", "Đức", "Ngọc"};
                String[] firstNames = {"An", "Bình", "Cường", "Dũng", "Giang", "Hương", "Khanh", "Lan", "Minh", "Nam"};

                for (int i = 0; i < 15; i++) {
                    String email = "user" + (i + 1) + "@gmail.com";
                    if (accountRepository.existsByEmail(email)) continue;

                    Account account = new Account();
                    account.setEmail(email);
                    account.setPassword(passwordEncoder.encode("123456"));
                    account.setRole(Role.USER);
                    account.setStatus(AccountStatus.ACTIVE);
                    // Random ngày tạo trong 6 tháng qua để biểu đồ user tăng trưởng đẹp
                    account.setCreateAt(LocalDateTime.now().minusDays(random.nextInt(180)));
                    Account savedAcc = accountRepository.save(account);

                    User user = new User();
                    user.setAccount(savedAcc);
                    String fullName = lastNames[random.nextInt(lastNames.length)] + " " +
                            middleNames[random.nextInt(middleNames.length)] + " " +
                            firstNames[random.nextInt(firstNames.length)];
                    user.setFullName(fullName);
                    user.setPhone("09" + (random.nextInt(90000000) + 10000000));
                    user.setAddress(random.nextInt(100) + " Đường ABC, Quận " + (random.nextInt(12) + 1) + ", TP.HCM");
                    user.setGender(random.nextBoolean() ? Gender.MALE : Gender.FEMALE);

                    dummyUsers.add(userRepository.save(user));
                }
            } else {
                // Nếu đã có user thì load lên để dùng
                dummyUsers = userRepository.findAllByAccount_StatusNot(AccountStatus.DELETED);
                // Loại bỏ admin khỏi danh sách đặt hàng cho giống thực tế
                dummyUsers.removeIf(u -> u.getAccount().getRole() == Role.ADMIN);
            }

            // ==========================================
            // 3. KHỞI TẠO DỮ LIỆU XE
            // ==========================================
            List<Car> allCars;
            if (carRepository.count() == 0) {
                log.info("Start seeding 50 cars data...");
                List<Car> cars = new ArrayList<>();
                String[] toyotaModels = {"Vios 1.5G", "Camry 2.5Q", "Fortuner Legender", "Corolla Cross", "Innova Cross"};
                String[] hyundaiModels = {"Accent AT", "Tucson 1.6 Turbo", "SantaFe Premium", "Grand i10", "Creta Cao Cấp"};
                String[] mercedesModels = {"C300 AMG", "GLC 300 4Matic", "S450 Luxury", "E300 AMG", "Maybach S680"};
                String[] vinfastModels = {"VF 3", "VF 5 Plus", "VF 8 Eco", "VF 9 Plus", "VF e34"};

                for (int i = 0; i < 50; i++) {
                    Car car = new Car();
                    Brand brand = Brand.values()[random.nextInt(Brand.values().length)];
                    String model;
                    BigDecimal basePrice;

                    switch (brand) {
                        case TOYOTA -> {
                            model = toyotaModels[random.nextInt(toyotaModels.length)];
                            basePrice = BigDecimal.valueOf(500_000_000 + random.nextInt(1_000_000_000));
                        }
                        case HYUNDAI -> {
                            model = hyundaiModels[random.nextInt(hyundaiModels.length)];
                            basePrice = BigDecimal.valueOf(400_000_000 + random.nextInt(900_000_000));
                        }
                        case MERCEDES -> {
                            model = mercedesModels[random.nextInt(mercedesModels.length)];
                            basePrice = BigDecimal.valueOf(2_000_000_000L + random.nextLong(3_000_000_000L));
                        }
                        case VINFAST -> {
                            model = vinfastModels[random.nextInt(vinfastModels.length)];
                            basePrice = BigDecimal.valueOf(300_000_000 + random.nextInt(1_500_000_000));
                        }
                        default -> {
                            model = "Generic Model";
                            basePrice = BigDecimal.valueOf(500_000_000);
                        }
                    }

                    car.setBrand(brand);
                    car.setModel(model);
                    car.setCategory(Category.values()[random.nextInt(Category.values().length)]);
                    car.setManufactureYear(2018 + random.nextInt(7));
                    car.setPrice(basePrice);
                    car.setDescription("Xe " + brand + " " + model + " chính chủ, nội thất đẹp, máy móc nguyên bản.");

                    int qty = random.nextInt(10);
                    car.setQuantity(qty);
                    car.setSoldQuantity(random.nextInt(5));
                    car.setStatus(qty > 0 ? CarStatus.AVAILABLE : CarStatus.SOLD);

                    int numColors = 1 + random.nextInt(3);
                    for (int c = 0; c < numColors; c++) {
                        car.getColors().add(Color.values()[random.nextInt(Color.values().length)]);
                    }

                    CarDetail detail = new CarDetail();
                    detail.setEngine(random.nextBoolean() ? "2.0L Turbo" : "1.5L EcoBoost");
                    detail.setHorsepower(150 + random.nextInt(300));
                    detail.setTorque(200 + random.nextInt(400));
                    detail.setTransmission(random.nextBoolean() ? "Tự động 8 cấp" : "Vô cấp CVT");
                    detail.setFuelType(brand == Brand.VINFAST ? "Điện" : (random.nextBoolean() ? "Xăng" : "Dầu"));

                    if (brand == Brand.VINFAST) {
                        detail.setFuelConsumption("0");
                    } else {
                        double consumption = 6.0 + random.nextDouble() * 10.0;
                        detail.setFuelConsumption(String.format("%.1f", consumption).replace(",", "."));
                    }

                    detail.setSeats(random.nextBoolean() ? 5 : 7);
                    detail.setWeight(1200.0 + random.nextInt(1000));
                    detail.setDimensions("4500 x 1800 x 1500 mm");

                    car.setCarDetailInfo(detail);

                    String[] sampleImages = {
                            "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=600",
                            "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=600",
                            "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=600",
                            "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=600",
                            "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=600"
                    };

                    int numImages = 2 + random.nextInt(3);
                    for (int img = 0; img < numImages; img++) {
                        String imgUrl = sampleImages[random.nextInt(sampleImages.length)];
                        CarImage carImage = new CarImage();
                        carImage.setImageUrl(imgUrl);
                        car.addImage(carImage);
                    }

                    cars.add(car);
                }
                allCars = carRepository.saveAll(cars);
            } else {
                allCars = carRepository.findAll();
            }

            // ==========================================
            // 4. KHỞI TẠO ĐƠN HÀNG (MỚI - QUAN TRỌNG)
            // ==========================================
            if (orderRepository.count() == 0 && !dummyUsers.isEmpty() && !allCars.isEmpty()) {
                log.info("Start seeding 80 orders data...");
                List<Order> orders = new ArrayList<>();

                for (int i = 0; i < 80; i++) {
                    Order order = new Order();

                    // 1. Random User
                    User user = dummyUsers.get(random.nextInt(dummyUsers.size()));
                    order.setUser(user);

                    // 2. Fake Shipping Info (Lấy luôn từ User cho nhanh)
                    order.setFullName(user.getFullName());
                    order.setPhone(user.getPhone());
                    order.setAddress(user.getAddress());
                    order.setEmail(user.getAccount().getEmail());
                    order.setCity("Hồ Chí Minh");
                    order.setDistrict("Quận 1");
                    order.setWard("Phường Bến Nghé");

                    // 3. Random Ngày đặt (Trong 6 tháng gần đây)
                    // Logic: Càng gần hiện tại càng nhiều đơn (để biểu đồ đẹp)
                    int daysAgo = random.nextInt(180);
                    LocalDateTime orderDate = LocalDateTime.now().minusDays(daysAgo);
                    order.setOrderDate(orderDate);
                    // Cập nhật created_at cho khớp order_date để query thống kê chạy đúng
                    order.setCreatedAt(orderDate);

                    // 4. Random Trạng thái
                    // Đơn cũ (> 10 ngày) thường là Completed/Cancelled
                    // Đơn mới (< 10 ngày) thường là Pending/Shipping
                    OrderStatus status;
                    if (daysAgo > 10) {
                        int r = random.nextInt(100);
                        if (r < 70) status = OrderStatus.COMPLETED; // 70% thành công
                        else if (r < 90) status = OrderStatus.CANCELLED; // 20% hủy
                        else status = OrderStatus.DELIVERED;
                    } else {
                        int r = random.nextInt(100);
                        if (r < 40) status = OrderStatus.PENDING;
                        else if (r < 70) status = OrderStatus.CONFIRMED;
                        else status = OrderStatus.SHIPPING;
                    }
                    order.setStatus(status);

                    if (status == OrderStatus.CANCELLED) {
                        order.setCancelReason("Khách hàng thay đổi ý định");
                    }

                    // 5. Tạo Order Details (1 đơn mua 1-2 xe)
                    List<OrderDetail> details = new ArrayList<>();
                    BigDecimal subtotal = BigDecimal.ZERO;
                    int itemCount = 1 + random.nextInt(2); // 1 hoặc 2 xe

                    for (int k = 0; k < itemCount; k++) {
                        Car car = allCars.get(random.nextInt(allCars.size()));
                        OrderDetail detail = new OrderDetail();
                        detail.setOrder(order);
                        detail.setCar(car);
                        detail.setPrice(car.getPrice());
                        detail.setQuantity(1);

                        // Chọn màu ngẫu nhiên của xe đó
                        Set<Color> carColors = car.getColors();
                        if (!carColors.isEmpty()) {
                            detail.setColorName(carColors.iterator().next());
                        } else {
                            detail.setColorName(Color.BLACK);
                        }

                        subtotal = subtotal.add(car.getPrice());
                        details.add(detail);
                    }
                    order.setOrderDetails(details);

                    // 6. Tính tiền
                    order.setSubtotal(subtotal);
                    order.setShippingFee(BigDecimal.valueOf(5_000_000)); // Phí ship cố định 5tr
                    order.setTax(subtotal.multiply(BigDecimal.valueOf(0.1))); // Thuế 10%
                    order.setTotalAmount(subtotal.add(order.getShippingFee()).add(order.getTax()));

                    // 7. Tạo Payment
                    Payment payment = new Payment();
                    payment.setOrder(order);
                    payment.setAmount(order.getTotalAmount());
                    payment.setPaymentMethod(random.nextBoolean() ? PaymentMethod.BANK_TRANSFER : PaymentMethod.CASH);

                    // Trạng thái thanh toán theo đơn hàng
                    if (status == OrderStatus.COMPLETED || status == OrderStatus.DELIVERED) {
                        payment.setStatus(PaymentStatus.SUCCESS);
                        payment.setPaymentDate(orderDate.plusDays(1)); // Thanh toán sau 1 ngày
                    } else if (status == OrderStatus.CANCELLED) {
                        payment.setStatus(PaymentStatus.FAILED);
                    } else {
                        payment.setStatus(PaymentStatus.PENDING);
                    }
                    order.setPayment(payment);

                    orders.add(order);
                }
                orderRepository.saveAll(orders);
                log.info("Successfully seeded " + orders.size() + " orders for dashboard demo.");
            }

            // ==========================================
            // 3. KHỞI TẠO DỮ LIỆU TIN TỨC (MỚI)
            // ==========================================
            if (newsRepository.count() == 0) {
                log.info("Start seeding 20 news data...");
                List<News> newsList = new ArrayList<>();

                String[] newsTitles = {
                        "Ra mắt mẫu xe điện VinFast VF 3 giá rẻ bất ngờ",
                        "Đánh giá Toyota Camry 2024: Ông vua phân khúc D",
                        "Top 5 mẫu SUV đáng mua nhất năm nay",
                        "Hướng dẫn bảo dưỡng xe ô tô tại nhà đơn giản",
                        "Thị trường ô tô Việt Nam: Xu hướng xe xanh lên ngôi",
                        "Mercedes-Benz S-Class mới: Đẳng cấp doanh nhân",
                        "Hyundai SantaFe 2024 lộ diện thiết kế gây tranh cãi",
                        "Kinh nghiệm lái xe an toàn trong mùa mưa bão",
                        "So sánh chi phí sử dụng xe xăng và xe điện",
                        "Lý do nên mua bảo hiểm thân vỏ cho xe ô tô",
                        "Ford Everest thế hệ mới có gì đặc biệt?",
                        "Mazda CX-5 giảm giá sâu để kích cầu tiêu dùng",
                        "Honda CR-V Hybrid: Tiết kiệm nhiên liệu vượt trội",
                        "Kia Carnival: Mẫu MPV gia đình lý tưởng",
                        "Mitsubishi Xpander tiếp tục dẫn đầu doanh số",
                        "Porsche Macan điện: Sự kết hợp hoàn hảo",
                        "BMW X5 bản nâng cấp có giá bán hấp dẫn",
                        "Audi Q8 e-tron: Xe sang chạy điện đẳng cấp",
                        "Volvo XC90: An toàn là trên hết",
                        "Lexus RX 350: Sự lựa chọn của giới thượng lưu"
                };

                String[] newsImages = {
                        "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600",
                        "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=600",
                        "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=600",
                        "https://images.pexels.com/photos/4449412/pexels-photo-4449412.jpeg?auto=compress&cs=tinysrgb&w=600",
                        "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=600"
                };

                String loremContent = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>";

                for (int i = 0; i < 20; i++) {
                    News news = new News();
                    news.setTitle(newsTitles[i]);
                    news.setSlug("tin-tuc-" + (i + 1) + "-" + System.currentTimeMillis()); // Tạo slug đơn giản
                    news.setExcerpt("Tóm tắt nội dung bài viết về " + newsTitles[i] + ". Click để xem chi tiết.");
                    news.setContent("<h2>Chi tiết về " + newsTitles[i] + "</h2>" + loremContent);

                    // Random trạng thái: 80% Published, 20% Draft
                    news.setStatus(random.nextInt(10) < 8 ? NewsStatus.PUBLISHED : NewsStatus.DRAFT);

                    if (news.getStatus() == NewsStatus.PUBLISHED) {
                        news.setPublishedAt(LocalDateTime.now().minusDays(random.nextInt(30))); // Publish trong vòng 30 ngày qua
                    }

                    // Ảnh ngẫu nhiên
                    news.setCoverImageUrl(newsImages[random.nextInt(newsImages.length)]);

                    newsList.add(news);
                }

                newsRepository.saveAll(newsList);
                log.info("Successfully created " + newsList.size() + " news.");
            }
        };
    }
}