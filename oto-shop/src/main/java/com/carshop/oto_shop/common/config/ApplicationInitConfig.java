package com.carshop.oto_shop.common.config;

import com.carshop.oto_shop.entities.*;
import com.carshop.oto_shop.enums.*;
import com.carshop.oto_shop.repositories.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper; // Dùng để parse JSON

    public ApplicationInitConfig(PasswordEncoder passwordEncoder, ObjectMapper objectMapper) {
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
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
            // 3. KHỞI TẠO DỮ LIỆU XE (DỰA TRÊN JSON)
            // ==========================================
            List<Car> allCars = new ArrayList<>();
            if (carRepository.count() == 0) {
                log.info("Start seeding cars data from JSON files...");

                // Danh sách các chuỗi JSON (Tôi đã gộp dữ liệu bạn cung cấp)
                String[] jsonFiles = {HYUNDAI_JSON, TOYOTA_JSON, MERCEDES_JSON, VINFAST_JSON};

                for (String jsonContent : jsonFiles) {
                    JsonNode rootNode = objectMapper.readTree(jsonContent);
                    for (JsonNode node : rootNode) {
                        Car car = new Car();
                        car.setBrand(Brand.valueOf(node.get("brand").asText().toUpperCase().replace("-", "_")));
                        car.setModel(node.get("model").asText());
                        car.setCategory(Category.valueOf(node.get("category").asText().toUpperCase()));
                        car.setManufactureYear(node.get("manufactureYear").asInt());
                        car.setPrice(new BigDecimal(node.get("price").asText()));
                        car.setDescription(node.get("description").asText());
                        car.setQuantity(node.get("quantity").asInt());
                        car.setSoldQuantity(node.get("soldQuantity").asInt());
                        car.setStatus(CarStatus.valueOf(node.get("status").asText().toUpperCase()));

                        // Colors
                        for (JsonNode colorNode : node.get("colors")) {
                            car.getColors().add(Color.valueOf(colorNode.asText().toUpperCase()));
                        }

                        // Images
                        for (JsonNode imgNode : node.get("imageUrls")) {
                            CarImage carImage = new CarImage();
                            carImage.setImageUrl(imgNode.asText());
                            car.addImage(carImage);
                        }

                        // Details
                        JsonNode detailNode = node.get("detail");
                        CarDetail detail = new CarDetail();
                        detail.setEngine(detailNode.get("engine").asText());
                        detail.setHorsepower(detailNode.get("horsepower").asInt());
                        detail.setTorque(detailNode.get("torque").asInt());
                        detail.setTransmission(detailNode.get("transmission").asText());
                        detail.setFuelType(detailNode.get("fuelType").asText());
                        detail.setFuelConsumption(detailNode.get("fuelConsumption").asText());
                        detail.setSeats(detailNode.get("seats").asInt());
                        detail.setWeight(detailNode.get("weight").asDouble());
                        detail.setDimensions(detailNode.get("dimensions").asText());

                        car.setCarDetailInfo(detail);
                        allCars.add(car);
                    }
                }
                allCars = carRepository.saveAll(allCars);
                log.info("Successfully seeded " + allCars.size() + " cars from JSON.");
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
                log.info("Start seeding 30 news records based on JSON data...");
                List<News> newsList = new ArrayList<>();

                // Mảng chứa: {Title, Excerpt, Content, ImageUrl, PublishDate}
                String[][] newsRawData = {
                        // --- HYUNDAI (7 bài) ---
                        {
                                "Hyundai i10 Sedan 2024",
                                "Khám phá mẫu sedan hạng A kinh tế nhất hiện nay.",
                                "Hyundai i10 Sedan 2024 trang bị động cơ Kappa 1.2L mạnh mẽ với 83 mã lực. Đây là sự lựa chọn hoàn hảo cho di chuyển đô thị với mức tiêu thụ nhiên liệu chỉ 5.4L/100km, mang lại sự bền bỉ và không gian nội thất rộng rãi bất ngờ.",
                                "https://cdn.dailyxe.com.vn/image/hyundai-grand-i10-sedan-12-mt-tieu-chuan-330721j15.jpg",
                                "2025-12-01T08:00:00"
                        },
                        {
                                "Hyundai i10 Hatchback 2024",
                                "Sự lựa chọn linh hoạt cho phái đẹp và gia đình trẻ.",
                                "Hyundai i10 Hatchback 2024 sở hữu thiết kế năng động, sử dụng động cơ I4 với công suất 83 mã lực. Với kích thước nhỏ gọn 3815 x 1680 x 1520 mm, mẫu xe này giúp bạn dễ dàng luồn lách qua những con phố đông đúc một cách thoải mái nhất.",
                                "https://cdn.dailyxe.com.vn/image/hyundai-grand-i10-hatchback-12-mt-tieu-chuan-330693j15.jpg",
                                "2025-12-01T09:00:00"
                        },
                        {
                                "Hyundai Accent 2024",
                                "Mẫu Sedan hạng B bán chạy nhất với diện mạo hoàn toàn mới.",
                                "Hyundai Accent 2024 đột phá với động cơ SmartStream G1.5, sản sinh công suất 115 mã lực. Nội thất hiện đại kết hợp với hệ thống truyền động vô cùng êm ái, mẫu xe này hứa hẹn giữ vững ngôi vương doanh số trong phân khúc Sedan 2024.",
                                "https://cdn.dailyxe.com.vn/image/hyundai-accent-at-cao-cap-329352j15.jpg",
                                "2025-12-02T10:00:00"
                        },
                        {
                                "Hyundai Elantra 2022",
                                "Cảm giác lái thể thao đầy phấn khích trên dòng xe N-Line.",
                                "Hyundai Elantra 2022 phiên bản N-Line sử dụng động cơ Smartstream 1.6L đầy uy lực với 204 mã lực. Kết hợp cùng hộp số ly hợp kép 7 cấp, Elantra 2022 mang đến trải nghiệm tốc độ đỉnh cao và thiết kế khí động học sắc sảo.",
                                "https://cdn.dailyxe.com.vn/image/hyundai-elantra-n-line-340544j15.jpg",
                                "2025-12-02T11:00:00"
                        },
                        {
                                "Hyundai Creta 2025",
                                "Bản nâng cấp N-Line đầy uy lực và công nghệ.",
                                "Hyundai Creta 2025 phiên bản N-Line sở hữu động cơ SmartStream 1.5G tiết kiệm nhiên liệu. Với diện mạo mới mẻ và 6 chỗ ngồi tiện nghi, đây là bước đi chiến lược giúp Hyundai khẳng định vị thế trong phân khúc CUV hạng B cạnh tranh.",
                                "https://cdn.dailyxe.com.vn/image/hyundai-creta-nline-343507j15.jpg",
                                "2025-12-03T14:00:00"
                        },
                        {
                                "Hyundai SantaFe 2023",
                                "Công nghệ Hybrid tiên phong trên dòng SUV gia đình.",
                                "Hyundai SantaFe 2023 Hybrid là sự kết hợp giữa động cơ G1.6T-GDI và mô-tơ điện cho tổng công suất 230 mã lực. Mẫu SUV 7 chỗ này không chỉ sang trọng mà còn cực kỳ bảo vệ môi trường, vận hành êm ái trên mọi cung đường phức tạp.",
                                "https://cdn.dailyxe.com.vn/image/hyundai-santa-fe-hybrid-320564j15.jpg",
                                "2025-12-03T15:00:00"
                        },
                        {
                                "Hyundai IONIQ 5 2023",
                                "Kỷ nguyên xe điện hạng sang chính thức bắt đầu.",
                                "Hyundai IONIQ 5 2023 bản Prestige sử dụng động cơ điện EM17 hiện đại. Thiết kế tương lai cùng khả năng sạc siêu nhanh giúp IONIQ 5 2023 trở thành biểu tượng của lối sống xanh và đẳng cấp công nghệ từ Hàn Quốc.",
                                "https://cdn.dailyxe.com.vn/image/hyundai-ioniq5-prestige-320281j15.jpg",
                                "2025-12-04T08:00:00"
                        },

                        // --- TOYOTA (8 bài) ---
                        {
                                "Toyota Vios 2023",
                                "Mẫu xe quốc dân bền bỉ và tiết kiệm hàng đầu.",
                                "Toyota Vios 2023 trang bị động cơ 2NR-FE 1.5L trứ danh về độ bền. Với khả năng tiết kiệm xăng chỉ 5.92L/100km và chi phí bảo dưỡng thấp, Vios 2023 tiếp tục là người bạn đồng hành tin cậy cho hàng triệu gia đình Việt.",
                                "https://cdn.dailyxe.com.vn/image/toyota-vios-15e-mt-308379j15.jpg",
                                "2025-12-04T09:00:00"
                        },
                        {
                                "Toyota Corolla Cross 2024",
                                "Sức mạnh Hybrid vượt trội cho trải nghiệm thượng lưu.",
                                "Toyota Corolla Cross 2024 phiên bản 1.8HV sở hữu động cơ 2ZR-FXE với công suất 138 mã lực. Điểm nhấn là mức tiêu thụ nhiên liệu siêu ấn tượng chỉ 4.62L/100km, mang lại sự yên tĩnh và thân thiện tuyệt đối với môi trường đô thị.",
                                "https://cdn.dailyxe.com.vn/image/toyota-corolla-cross-hybird-18hv-327708j15.jpg",
                                "2025-12-05T10:00:00"
                        },
                        {
                                "Toyota Raize 2021",
                                "SUV cỡ nhỏ năng động cho giới trẻ hiện đại.",
                                "Toyota Raize 2021 sử dụng động cơ Turbo 1.0L nhỏ gọn nhưng đầy linh hoạt với 98 mã lực. Thiết kế gầm cao đa dụng giúp Raize 2021 dễ dàng chinh phục các địa hình đô thị phức tạp tại Việt Nam.",
                                "https://cdn.dailyxe.com.vn/image/toyota-raize-cvt-340779j15.jpg",
                                "2025-12-05T11:00:00"
                        },
                        {
                                "Toyota Fortuner 2020",
                                "Mạnh mẽ và uy nghi trên mọi nẻo đường.",
                                "Toyota Fortuner 2020 phiên bản Legender trang bị động cơ dầu 2.8L (1GD-FTV) bền bỉ. Với hệ dẫn động 4x4 mạnh mẽ, Fortuner 2020 sẵn sàng đưa bạn đến những vùng đất xa xôi nhất với sự an toàn và đẳng cấp vượt trội.",
                                "https://cdn.dailyxe.com.vn/image/toyota-fortuner-legender-28-at-4x4-340454j15.jpg",
                                "2025-12-06T08:00:00"
                        },
                        {
                                "Toyota Camry 2024",
                                "Chuẩn mực Sedan hạng sang dành cho doanh nhân.",
                                "Toyota Camry 2024 phiên bản HEV sử dụng công nghệ Hybrid A25A-FXS tiên tiến. Với công suất kết hợp mạnh mẽ và thiết kế lịch lãm, Camry 2024 mang lại không gian tĩnh lặng, sang trọng và khẳng định vị thế chủ nhân.",
                                "https://cdn.dailyxe.com.vn/image/toyota-camry-25hev-337152j15.jpg",
                                "2025-12-06T15:00:00"
                        },
                        {
                                "Toyota Corolla Altis 2023",
                                "Lịch lãm và hiện đại trong từng chi tiết.",
                                "Toyota Corolla Altis 2023 phiên bản 1.8HEV vận hành cực kỳ tiết kiệm với mức tiêu thụ 4.5L/100km. Động cơ 2ZR-FXE mang lại sự mượt mà tuyệt đối, phù hợp với những khách hàng tìm kiếm sự tinh tế và an toàn.",
                                "https://cdn.dailyxe.com.vn/image/toyota-corolla-altis-18hv-cvt-323335j15.jpg",
                                "2025-12-07T09:00:00"
                        },
                        {
                                "Toyota Yaris Cross 2023",
                                "SUV đô thị thông minh và tiết kiệm.",
                                "Toyota Yaris Cross 2023 phiên bản Hybrid (HEV) trang bị động cơ 2NR-VEX hiện đại. Mẫu xe này nổi bật với thiết kế thể thao, nội thất rộng rãi và khả năng tiết kiệm nhiên liệu tối ưu trong phân khúc B-SUV.",
                                "https://cdn.dailyxe.com.vn/image/toyota-yaris-hybrid-322886j15.jpg",
                                "2025-12-07T14:00:00"
                        },
                        {
                                "Toyota Land Cruiser 2022",
                                "Huyền thoại off-road đẳng cấp thế giới.",
                                "Toyota Land Cruiser 2022 phiên bản 300 sử dụng động cơ V35A-FTS xăng mạnh mẽ. Với khả năng vượt địa hình không đối thủ và trang bị nội thất xa xỉ, Land Cruiser 2022 xứng đáng là biểu tượng của sự quyền lực.",
                                "https://cdn.dailyxe.com.vn/image/toyota-land-cruiser-vx-340637j15.jpg",
                                "2025-12-08T08:00:00"
                        },

                        // --- MERCEDES (10 bài) ---
                        {
                                "Mercedes EQS Sedan 2022",
                                "Siêu phẩm xe điện hạng sang của ngôi sao ba cánh.",
                                "Mercedes EQS Sedan 2022 bản 450 trang bị động cơ điện 333 mã lực và mô-men xoắn 565Nm. Với tầm hoạt động cực xa và không gian nội thất như du thuyền, EQS Sedan 2022 định nghĩa lại khái niệm xa xỉ trong kỷ nguyên điện.",
                                "https://cdn.dailyxe.com.vn/image/mercedes-eqs-450-may-dien-298927j15.jpg",
                                "2025-12-08T16:00:00"
                        },
                        {
                                "Mercedes A-Class 2022",
                                "Hatchback hạng sang phong cách và cá tính.",
                                "Mercedes A-Class 2022 phiên bản A200 sử dụng động cơ R4 1.6L đầy linh hoạt. Với thiết kế nhỏ gọn và nội thất hiện đại, mẫu xe này là lựa chọn tuyệt vời cho những chủ nhân trẻ tuổi yêu thích sự sang trọng và khác biệt.",
                                "https://cdn.dailyxe.com.vn/image/mercedes-benz-a200-54280j15.jpg",
                                "2025-12-09T09:00:00"
                        },
                        {
                                "Mercedes C-Class 2022",
                                "Tiểu S-Class với công nghệ dẫn đầu phân khúc.",
                                "Mercedes C-Class 2022 phiên bản C200 Avantgarde trang bị động cơ I4 công suất 204 mã lực. Hệ thống đèn viền nội thất và màn hình giải trí siêu lớn tạo nên một không gian trải nghiệm đẳng cấp ngay trên dòng xe Sedan hạng sang cỡ nhỏ này.",
                                "https://cdn.dailyxe.com.vn/image/mercedes-benz-c200-298840j15.jpg",
                                "2025-12-09T15:00:00"
                        },
                        {
                                "Mercedes E-Class 2022",
                                "Vẻ đẹp sang trọng vượt thời gian.",
                                "Mercedes E-Class 2022 phiên bản E180 sử dụng động cơ I4 1.5L mượt mà cùng hộp số 9 cấp. Đây là mẫu xe biểu tượng của sự thành đạt, mang lại sự êm ái tối đa cho những chuyến công tác dài hay di chuyển hằng ngày.",
                                "https://cdn.dailyxe.com.vn/image/mercedes-benz-e180-299830j15.jpg",
                                "2025-12-10T08:00:00"
                        },
                        {
                                "Mercedes S-Class 2022",
                                "Kiệt tác công nghệ dành cho những chủ nhân tinh túy nhất.",
                                "Mercedes S-Class 2022 phiên bản S450 4MATIC Luxury trang bị động cơ V6 mạnh mẽ 367 mã lực. Với hệ thống treo khí nén Airmatic và ghế massage đá nóng, S-Class 2022 mang đến sự thoải mái tuyệt đối như ngồi trong cung điện di động.",
                                "https://cdn.dailyxe.com.vn/image/mercedes-s450-4matic-luxury-301649j15.jpg",
                                "2025-12-10T14:00:00"
                        },
                        {
                                "Mercedes-Maybach S-Class 2022",
                                "Đỉnh cao của sự xa hoa và quyền quý.",
                                "Mercedes-Maybach S-Class 2022 phiên bản S680 sử dụng động cơ V12 uy lực. Chiều dài cơ sở lớn cùng nội thất chế tác thủ công bằng những vật liệu đắt đỏ nhất khiến Maybach S-Class 2022 trở thành chuẩn mực cao nhất của ngành ô tô thế giới.",
                                "https://cdn.dailyxe.com.vn/image/mercedes-maybach-s-680-4matic-301905j15.jpg",
                                "2025-12-11T09:00:00"
                        },
                        {
                                "Mercedes GLC 2023",
                                "SUV hạng sang được yêu thích nhất toàn cầu.",
                                "Mercedes GLC 2023 phiên bản 300 4Matic trang bị động cơ I4 tăng áp mạnh mẽ. Hệ dẫn động 4 bánh thông minh cùng khoảng sáng gầm tối ưu giúp GLC 2023 chinh phục mọi cung đường từ phố thị đến ngoại ô một cách tự tin.",
                                "https://cdn.dailyxe.com.vn/image/mercedes-benz-glc-300-4matic-308494j15.jpg",
                                "2025-12-11T16:00:00"
                        },
                        {
                                "Mercedes G-Class 2022",
                                "Huyền thoại địa hình bất diệt.",
                                "Mercedes G-Class 2022 phiên bản AMG G63 sử dụng khối động cơ V8 cho âm thanh ống xả đầy phấn khích. Khả năng off-road phi thường cùng vẻ ngoài vuông vức đặc trưng khiến G-Class 2022 luôn là khao khát của mọi tín đồ xe hơi.",
                                "https://cdn.dailyxe.com.vn/image/mercedes-amg-g63-302303j15.jpg",
                                "2025-12-12T08:00:00"
                        },
                        {
                                "Mercedes-AMG GT 2022",
                                "Siêu xe thể thao thuần chất trên đường phố.",
                                "Mercedes-AMG GT 2022 phiên bản GT R sở hữu động cơ V8 4.0L sản sinh sức mạnh 585 mã lực. Với khả năng tăng tốc chóng mặt và thiết kế khí động học hoàn hảo, đây là mẫu xe dành cho những người đam mê tốc độ thực thụ.",
                                "https://cdn.dailyxe.com.vn/image/mercedes-amg-gt-r-125479j15.jpg",
                                "2025-12-12T13:00:00"
                        },
                        {
                                "Mercedes E-Class 2025",
                                "Sự lột xác về công nghệ và phong cách.",
                                "Mercedes E-Class 2025 phiên bản E300 AMG là biểu tượng mới của kỷ nguyên số. Động cơ I4 kết hợp cùng các tính năng thông minh thế hệ mới nhất mang lại trải nghiệm lái cá nhân hóa và đẳng cấp vượt trội.",
                                "https://cdn.dailyxe.com.vn/image/mercedes-amg-e300-345311j15.jpg",
                                "2025-12-13T10:00:00"
                        },

                        // --- VINFAST (5 bài) ---
                        {
                                "VF6 Eco 2025",
                                "SUV điện gia đình thời thượng và kinh tế.",
                                "VF6 Eco 2025 trang bị động cơ điện 130kW với 174 mã lực đầy ấn tượng. Với kích thước 4238 x 1820 x 1594 mm và tầm vận hành dài, VF6 Eco 2025 là lựa chọn lý tưởng cho các gia đình hiện đại yêu thích sống xanh.",
                                "https://cdn.chotot.com/f-aok_1XRtbLzNDw26COThXgTtLaf4fkumEN2piysHI/preset:view/plain/6f57c639037c5e5f3c30b1bf2559b2a8-2963070170500638772.jpg",
                                "2025-12-13T15:00:00"
                        },
                        {
                                "VF5 Plus 2025",
                                "Xe điện quốc dân cho tương lai bền vững.",
                                "VF5 Plus 2025 sở hữu động cơ điện 100kW (134 mã lực) linh hoạt. Với thiết kế nhỏ gọn nhưng mạnh mẽ, mẫu SUV cỡ A này mang đến sự tiện lợi tối đa cho việc di chuyển trong đô thị với chi phí vận hành cực thấp.",
                                "https://cdn.chotot.com/rGeRABsIE634OqKgYMcbK_pgOP2KfKbd4H5Sz-tGjsk/preset:view/plain/a6ba99c7d7ced7e1c1a4e927a6db201a-2962498274925020990.jpg",
                                "2025-12-14T08:00:00"
                        },
                        {
                                "VF7 Plus 2025",
                                "Đỉnh cao công suất trên dòng SUV thuần điện phân khúc C.",
                                "VF7 Plus 2025 mạnh mẽ với động cơ Dual Motor 260kW đạt 349 mã lực. Hệ dẫn động AWD giúp xe bám đường tuyệt vời và tăng tốc như một chiếc xe thể thao thực thụ, hứa hẹn thay đổi hoàn toàn cuộc chơi xe điện.",
                                "https://cdn.chotot.com/gZPPQEL6AmHsrkXb4Fn_2Opms_Xz9m1hWP4nh_ecWhE/preset:view/plain/f1585650f008ba3c58bc18fa30be3169-2962497855982252988.jpg",
                                "2025-12-14T14:00:00"
                        },
                        {
                                "VF3 Standard 2025",
                                "Xe điện mini cá tính làm khuynh đảo thị trường.",
                                "VF3 Standard 2025 sử dụng động cơ điện 32kW, mô-men xoắn 110Nm bền bỉ. Với kích thước nhỏ xinh 3190 x 1679 x 1622 mm, VF3 Standard 2025 là biểu tượng mới của sự năng động, trẻ trung cho những cư dân đô thị hiện đại.",
                                "https://cdn.chotot.com/lWdZ7SFb6p3_eBmYkMAU8tlV2XB6Kj5Sr9dA80NW-H0/preset:view/plain/8d72dcae9b77a153d67e5939f9c06fe5-2962497053950784444.jpg",
                                "2025-12-15T09:00:00"
                        },
                        {
                                "Lux SA2.0 Plus 2020",
                                "SUV 7 chỗ mang tinh hoa khung gầm Đức.",
                                "Lux SA2.0 Plus 2020 trang bị động cơ 2.0L Turbo mạnh mẽ với 228 mã lực. Kết hợp cùng hộp số tự động 8 cấp ZF danh tiếng, mẫu xe này mang lại cảm giác lái đầm chắc, an toàn và sang trọng bậc nhất cho người dùng Việt.",
                                "https://cdn.chotot.com/gQfi5PQ7Sy2nbCdJ7bQMiwGQdrX4IJPoW9LQXTGTK7o/preset:view/plain/cf1c15e7b85fb9f7bdeab58f305b3345-2936251177761617228.jpg",
                                "2025-12-15T15:00:00"
                        }
                };

                for (String[] data : newsRawData) {
                    News news = new News();
                    news.setTitle(data[0]); // Model + ManufactureYear

                    // Tạo slug chuẩn từ tiêu đề
                    String slug = data[0].toLowerCase()
                            .replaceAll("[áàảãạăắằẳẵặâấầẩẫậ]", "a")
                            .replaceAll("[éèẻẽẹêếềểễệ]", "e")
                            .replaceAll("[íìỉĩị]", "i")
                            .replaceAll("[óòỏõọôốồổỗộơớờởỡợ]", "o")
                            .replaceAll("[úùủũụưứừửữự]", "u")
                            .replaceAll("[ýỳỷỹỵ]", "y")
                            .replaceAll("đ", "d")
                            .replaceAll("[^a-z0-9\\s]", "")
                            .replaceAll("\\s+", "-");
                    news.setSlug(slug + "-" + System.currentTimeMillis() % 10000);

                    news.setExcerpt(data[1]);
                    // Content bao gồm tiêu đề + nội dung sáng tạo dựa trên data thật
                    news.setContent("<h3>Thông tin về " + data[0] + "</h3><p>" + data[2] + "</p>");
                    news.setCoverImageUrl(data[3]);
                    news.setStatus(NewsStatus.PUBLISHED);
                    news.setPublishedAt(LocalDateTime.parse(data[4]));
                    news.setCreatedAt(LocalDateTime.parse(data[4]).minusMinutes(30));

                    newsList.add(news);
                }

                newsRepository.saveAll(newsList);
                log.info("Successfully created 30 news from real car data.");
            }
        };
    }
    // Dữ liệu JSON được định nghĩa dưới dạng hằng số để code chạy độc lập
    private static final String HYUNDAI_JSON = """
    [
      { "carId": 307, "brand": "HYUNDAI", "category": "SEDAN", "model": "Hyundai i10 Sedan", "manufactureYear": 2024, "price": 380000000, "description": "Xe Hyundai Grand i10 Sedan 1.2 MT Tiêu Chuẩn (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-grand-i10-sedan-12-mt-tieu-chuan-330721j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-grand-i10-sedan-12-mt-tieu-chuan-330721j.jpg"], "detail": { "engine": "Kappa 1.2L", "horsepower": 83, "torque": 4000, "transmission": "Số sàn 5 cấp", "fuelType": "Xăng", "fuelConsumption": "5.4", "seats": 5, "weight": 1380, "dimensions": "3995 x 1680 x 1520 mm" } },
      { "carId": 114, "brand": "HYUNDAI", "category": "HATCHBACK", "model": "Hyundai i10 Hatchback", "manufactureYear": 2024, "price": 360000000, "description": "Xe Hyundai Grand i10 Hatchback 1.2 MT Tiêu Chuẩn (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-grand-i10-hatchback-12-mt-tieu-chuan-330693j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-grand-i10-hatchback-12-mt-tieu-chuan-330693j.jpg"], "detail": { "engine": "I4", "horsepower": 83, "torque": 0, "transmission": "Số sàn 5 cấp", "fuelType": "Xăng", "fuelConsumption": "5.4", "seats": 5, "weight": 1380, "dimensions": "3815 x 1680 x 1520 mm" } },
      { "carId": 308, "brand": "HYUNDAI", "category": "SEDAN", "model": "Hyundai i10 Sedan", "manufactureYear": 2024, "price": 425000000, "description": "Xe Hyundai Grand i10 Sedan 1.2 AT Tiêu Chuẩn (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-grand-i10-sedan-12-at-tieu-chuan-330993j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-grand-i10-sedan-12-at-tieu-chuan-330993j.jpg"], "detail": { "engine": "Kappa 1.2L", "horsepower": 83, "torque": 4000, "transmission": "Tự động 4 cấp", "fuelType": "Xăng", "fuelConsumption": "5.4", "seats": 5, "weight": 1380, "dimensions": "3805 x 1680 x 1520 mm" } },
      { "carId": 1262, "brand": "HYUNDAI", "category": "SEDAN", "model": "Hyundai Accent", "manufactureYear": 2024, "price": 569000000, "description": "Xe Hyundai Accent 1.5 AT Cao Cấp (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-accent-at-cao-cap-329352j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-accent-at-cao-cap-329352j.jpg"], "detail": { "engine": "SmartStream G1.5", "horsepower": 115, "torque": 0, "transmission": "Số tự động 6 cấp", "fuelType": "Xăng", "fuelConsumption": "5.81", "seats": 5, "weight": 1570, "dimensions": "4535 x 1765 x 1485 mm" } },
      { "carId": 819, "brand": "HYUNDAI", "category": "SEDAN", "model": "Hyundai Elantra", "manufactureYear": 2022, "price": 769000000, "description": "Xe Hyundai Elantra N-Line (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-elantra-n-line-340544j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-elantra-n-line-340544j.jpg"], "detail": { "engine": "Smartstream 1.6L", "horsepower": 204, "torque": 0, "transmission": "Số tự động ly hợp kép 7 cấp", "fuelType": "Xăng", "fuelConsumption": "7.66", "seats": 5, "weight": 1780, "dimensions": "4675 x 1825 x 1440 mm" } },
      { "carId": 1021, "brand": "HYUNDAI", "category": "SUV", "model": "Hyundai Venue", "manufactureYear": 2023, "price": 559000000, "description": "Xe Hyundai Venue 1.0 T-GDi Đặc biệt (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-venue-t-gdi-dac-biet-324996j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-venue-t-gdi-dac-biet-324996j.jpg"], "detail": { "engine": "Kappa 1.0 T-GDi", "horsepower": 120, "torque": 0, "transmission": "Số tự động", "fuelType": "Xăng", "fuelConsumption": "6.17", "seats": 5, "weight": 1660, "dimensions": "3995 x 1770 x 1645 mm" } },
      { "carId": 1562, "brand": "HYUNDAI", "category": "SUV", "model": "Hyundai Creta", "manufactureYear": 2025, "price": 715000000, "description": "Hyundai Creta 1.5 N-Line sở hữu diện mạo mới mẻ, công nghệ hiện đại hơn.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-creta-nline-343507j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-creta-nline-343507j.jpg"], "detail": { "engine": "SmartStream 1.5G", "horsepower": 113, "torque": 0, "transmission": "Số tự động vô cấp", "fuelType": "Xăng", "fuelConsumption": "5.7", "seats": 6, "weight": 1660, "dimensions": "4315 x 1790 x 1660 mm" } },
      { "carId": 181, "brand": "HYUNDAI", "category": "SUV", "model": "Hyundai Tucson", "manufactureYear": 2024, "price": 979000000, "description": "Xe Hyundai Tucson 1.6 Turbo chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-tucson-turbo-336054j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-tucson-turbo-336054j.jpg"], "detail": { "engine": "Smartstream 1.6G", "horsepower": 180, "torque": 0, "transmission": "AT", "fuelType": "Xăng", "fuelConsumption": "8.8", "seats": 5, "weight": 0, "dimensions": "4630 x 1865 x 1695 mm" } },
      { "carId": 903, "brand": "HYUNDAI", "category": "SUV", "model": "Hyundai SantaFe", "manufactureYear": 2023, "price": 1369000000, "description": "Xe Hyundai Santa Fe Hybrid (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-santa-fe-hybrid-320564j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-santa-fe-hybrid-320564j.jpg"], "detail": { "engine": "G1.6T-GDI", "horsepower": 230, "torque": 0, "transmission": "6AT", "fuelType": "Hybrid", "fuelConsumption": "0", "seats": 7, "weight": 0, "dimensions": "4785 x 1900 x 1730 mm" } },
      { "carId": 939, "brand": "HYUNDAI", "category": "SUV", "model": "Hyundai Palisade", "manufactureYear": 2023, "price": 1589000000, "description": "Xe Hyundai Palisade Prestige 6 chỗ (Máy dầu) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-palisade-prestige-338531j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-palisade-prestige-338531j.jpg"], "detail": { "engine": "R2.2 CRDi", "horsepower": 200, "torque": 0, "transmission": "AT", "fuelType": "Dầu", "fuelConsumption": "0", "seats": 6, "weight": 0, "dimensions": "4995 x 1975 x 1785 mm" } },
      { "carId": 902, "brand": "HYUNDAI", "category": "SUV", "model": "Hyundai IONIQ 5", "manufactureYear": 2023, "price": 1450000000, "description": "Xe Hyundai IONIQ 5 Prestige (Máy điện) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/hyundai-ioniq5-prestige-320281j15.jpg", "https://cdn.dailyxe.com.vn/image/hyundai-ioniq5-prestige-320281j.jpg"], "detail": { "engine": "EM17", "horsepower": 0, "torque": 0, "transmission": "AT", "fuelType": "Xăng", "fuelConsumption": "0", "seats": 5, "weight": 0, "dimensions": "" } }
    ]
    """;

    // ==========================================
    // DỮ LIỆU TOYOTA (14 xe - Đầy đủ ảnh & Thông số)
    // ==========================================
    private static final String TOYOTA_JSON = """
    [
      { "carId": 54, "brand": "TOYOTA", "category": "SEDAN", "model": "Toyota Vios", "manufactureYear": 2023, "price": 458000000, "description": "Xe Toyota Vios 1.5E MT (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-vios-15e-mt-308379j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-vios-15e-mt-308379j.jpg"], "detail": { "engine": "2NR-FE 1.5L", "horsepower": 107, "torque": 4200, "transmission": "Số sàn 5 cấp", "fuelType": "Xăng", "fuelConsumption": "5.92", "seats": 5, "weight": 1550, "dimensions": "4425 x 1730 x 1475 mm" } },
      { "carId": 55, "brand": "TOYOTA", "category": "SEDAN", "model": "Toyota Vios", "manufactureYear": 2023, "price": 488000000, "description": "Xe Toyota Vios 1.5E CVT (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-vios-15e-cvt-308378j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-vios-15e-cvt-308378j.jpg"], "detail": { "engine": "2NR-FE 1.5L", "horsepower": 107, "torque": 4200, "transmission": "Số tự động vô cấp", "fuelType": "Xăng", "fuelConsumption": "5.77", "seats": 5, "weight": 1550, "dimensions": "4425 x 1730 x 1475 mm" } },
      { "carId": 579, "brand": "TOYOTA", "category": "SUV", "model": "Toyota Corolla Cross", "manufactureYear": 2024, "price": 913000000, "description": "Xe Toyota Corolla Cross 1.8HV (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-corolla-cross-hybird-18hv-327708j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-corolla-cross-hybird-18hv-327708j.jpg"], "detail": { "engine": "2ZR-FXE", "horsepower": 138, "torque": 0, "transmission": "Số tự động vô cấp", "fuelType": "Xăng", "fuelConsumption": "4.62", "seats": 5, "weight": 1850, "dimensions": "4460 x 1825 x 1620 mm" } },
      { "carId": 717, "brand": "TOYOTA", "category": "SUV", "model": "Toyota Raize", "manufactureYear": 2021, "price": 510000000, "description": "Xe Toyota Raize CVT (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-raize-cvt-340779j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-raize-cvt-340779j.jpg"], "detail": { "engine": "Turbo 1.0L", "horsepower": 98, "torque": 0, "transmission": "Số tự động vô cấp", "fuelType": "Xăng", "fuelConsumption": "6.61", "seats": 5, "weight": 0, "dimensions": "4030 x 1710 x 1605 mm" } },
      { "carId": 767, "brand": "TOYOTA", "category": "SUV", "model": "Toyota Veloz Cross", "manufactureYear": 2022, "price": 660000000, "description": "Xe Toyota Veloz Cross CVT Top (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-veloz-cross-cvt-top-340323j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-veloz-cross-cvt-top-340323j.jpg"], "detail": { "engine": "2NR-VE", "horsepower": 105, "torque": 0, "transmission": "Số tự động vô cấp", "fuelType": "Xăng", "fuelConsumption": "5.8", "seats": 7, "weight": 1735, "dimensions": "4475 x 1750 x 1700 mm" } },
      { "carId": 589, "brand": "TOYOTA", "category": "SUV", "model": "Toyota Fortuner", "manufactureYear": 2020, "price": 1185000000, "description": "Xe Toyota Fortuner Legender 2.4AT 4x2 (Máy dầu) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-fortuner-legender-24-at-4x2-340460j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-fortuner-legender-24-at-4x2-340460j.jpg"], "detail": { "engine": "2GD-FTV 2.4L", "horsepower": 147, "torque": 1600, "transmission": "Số tự động 6 cấp", "fuelType": "Dầu", "fuelConsumption": "8.28", "seats": 7, "weight": 2605, "dimensions": "4795 x 1855 x 1835 mm" } },
      { "carId": 590, "brand": "TOYOTA", "category": "SUV", "model": "Toyota Fortuner", "manufactureYear": 2020, "price": 1350000000, "description": "Xe Toyota Fortuner Legender 2.8AT 4x4 (Máy dầu) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-fortuner-legender-28-at-4x4-340454j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-fortuner-legender-28-at-4x4-340454j.jpg"], "detail": { "engine": "1GD-FTV 2.8L", "horsepower": 201, "torque": 1600, "transmission": "Số tự động 6 cấp", "fuelType": "Dầu", "fuelConsumption": "8.63", "seats": 7, "weight": 2735, "dimensions": "4795 x 1855 x 1835 mm" } },
      { "carId": 727, "brand": "TOYOTA", "category": "SEDAN", "model": "Toyota Camry", "manufactureYear": 2024, "price": 1232000000, "description": "Xe Toyota Camry 2.0Q (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-camry-20q-337145j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-camry-20q-337145j.jpg"], "detail": { "engine": "6AR-FSE 2.0L", "horsepower": 170, "torque": 0, "transmission": "Số tự động vô cấp", "fuelType": "Xăng", "fuelConsumption": "6.4", "seats": 5, "weight": 2030, "dimensions": "4915 x 1840 x 1445 mm" } },
      { "carId": 728, "brand": "TOYOTA", "category": "SEDAN", "model": "Toyota Camry", "manufactureYear": 2024, "price": 1472000000, "description": "Xe Toyota Camry HEV MID (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-camry-25hev-337152j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-camry-25hev-337152j.jpg"], "detail": { "engine": "A25A-FXS", "horsepower": 178, "torque": 0, "transmission": "Số tự động vô cấp", "fuelType": "Hybrid", "fuelConsumption": "4.4", "seats": 5, "weight": 2100, "dimensions": "4885 x 1840 x 1445 mm" } },
      { "carId": 1521, "brand": "TOYOTA", "category": "SEDAN", "model": "Toyota Camry", "manufactureYear": 2024, "price": 1542000000, "description": "Xe Toyota Camry HEV TOP (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-camry-hev-top-337145j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-camry-hev-top-337145j.jpg"], "detail": { "engine": "A25A-FXS", "horsepower": 185, "torque": 0, "transmission": "Số tự động vô cấp", "fuelType": "Hybrid", "fuelConsumption": "4.4", "seats": 5, "weight": 2030, "dimensions": "4915 x 1840 x 1445 mm" } },
      { "carId": 759, "brand": "TOYOTA", "category": "SEDAN", "model": "Toyota Corolla Altis", "manufactureYear": 2023, "price": 870000000, "description": "Xe Toyota Corolla Altis 1.8HEV (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-corolla-altis-18hv-cvt-323335j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-corolla-altis-18hv-cvt-323335j.jpg"], "detail": { "engine": "2ZR-FXE 1.8L", "horsepower": 97, "torque": 3600, "transmission": "Tự động vô cấp", "fuelType": "Hybrid", "fuelConsumption": "4.5", "seats": 5, "weight": 1830, "dimensions": "4630 x 1780 x 1455 mm" } },
      { "carId": 943, "brand": "TOYOTA", "category": "SUV", "model": "Toyota Yaris Cross", "manufactureYear": 2023, "price": 765000000, "description": "Xe Toyota Yaris Cross Hybrid (HEV) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-yaris-hybrid-322886j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-yaris-hybrid-322886j.jpg"], "detail": { "engine": "2NR-VEX", "horsepower": 90, "torque": 0, "transmission": "Tự động vô cấp", "fuelType": "Hybrid", "fuelConsumption": "6.38", "seats": 5, "weight": 1550, "dimensions": "4145 x 1730 x 1500 mm" } },
      { "carId": 101, "brand": "TOYOTA", "category": "SUV", "model": "Toyota Land Cruiser", "manufactureYear": 2022, "price": 4580000000, "description": "Xe Toyota Land Cruiser 300 (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-land-cruiser-vx-340637j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-land-cruiser-vx-340637j.jpg"], "detail": { "engine": "V35A-FTS", "horsepower": 409, "torque": 0, "transmission": "Số tự động 10 cấp", "fuelType": "Xăng", "fuelConsumption": "12.55", "seats": 8, "weight": 3230, "dimensions": "4965 x 1980 x 1945 mm" } },
      { "carId": 884, "brand": "TOYOTA", "category": "HATCHBACK", "model": "Toyota Wigo", "manufactureYear": 2023, "price": 405000000, "description": "Xe Toyota Wigo G (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/toyota-wigo-g-341585j15.jpg", "https://cdn.dailyxe.com.vn/image/toyota-wigo-g-341585j.jpg"], "detail": { "engine": "I4 2.0L", "horsepower": 87, "torque": 4500, "transmission": "Số tự động vô cấp", "fuelType": "Xăng", "fuelConsumption": "5.2", "seats": 5, "weight": 0, "dimensions": "3760 x 1665 x 1515 mm" } }
    ]
    """;

    // ==========================================
    // DỮ LIỆU MERCEDES (22 xe - Đầy đủ ảnh & Thông số)
    // ==========================================
    private static final String MERCEDES_JSON = """
    [
      { "carId": 851, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes EQS Sedan", "manufactureYear": 2022, "price": 5009000000, "description": "Xe Mercedes EQS 450 (Máy điện) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-eqs-450-may-dien-298927j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-eqs-450-may-dien-298927j.jpg"], "detail": { "engine": "Động cơ điện", "horsepower": 333, "torque": 565, "transmission": "Số tự động", "fuelType": "Điện", "fuelConsumption": "783", "seats": 5, "weight": 3025, "dimensions": "5222 x 1926 x 1515 mm" } },
      { "carId": 852, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes EQS Sedan", "manufactureYear": 2022, "price": 5959000000, "description": "Xe Mercedes EQS 580 4MATIC (Máy điện) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-eqs-580-4matic-may-dien-298907j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-eqs-580-4matic-may-dien-298907j.jpg"], "detail": { "engine": "Động cơ điện", "horsepower": 516, "torque": 858, "transmission": "Số tự động", "fuelType": "Điện", "fuelConsumption": "692", "seats": 5, "weight": 3025, "dimensions": "5222 x 1926 x 1515 mm" } },
      { "carId": 237, "brand": "MERCEDES", "category": "HATCHBACK", "model": "Mercedes A-Class", "manufactureYear": 2022, "price": 1339000000, "description": "Xe Mercedes A200 (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-benz-a200-54280j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-benz-a200-54280j.jpg"], "detail": { "engine": "R4 1.6L", "horsepower": 156, "torque": 250, "transmission": "Số tự động", "fuelType": "Xăng", "fuelConsumption": "5.6", "seats": 5, "weight": 1935, "dimensions": "4299 x 1780 x 1433 mm" } },
      { "carId": 238, "brand": "MERCEDES", "category": "HATCHBACK", "model": "Mercedes A-Class", "manufactureYear": 2022, "price": 1699000000, "description": "Xe Mercedes A250 (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-benz-a250-54281j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-benz-a250-54281j.jpg"], "detail": { "engine": "I4 2.0L", "horsepower": 211, "torque": 350, "transmission": "Số tự động ly hợp kép 7 cấp", "fuelType": "Xăng", "fuelConsumption": "6.4", "seats": 5, "weight": 2080, "dimensions": "4555 x 1796 x 1434 mm" } },
      { "carId": 257, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes A-Class", "manufactureYear": 2022, "price": 2429000000, "description": "Xe Mercedes-AMG A35 4MATIC (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-amg-a35-4macic-298816j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-amg-a35-4macic-298816j.jpg"], "detail": { "engine": "I4 2.0L", "horsepower": 306, "torque": 400, "transmission": "Số tự động ly hợp kép 7 cấp", "fuelType": "Xăng", "fuelConsumption": "9.81", "seats": 5, "weight": 2080, "dimensions": "4555 x 1796 x 1434 mm" } },
      { "carId": 249, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes C-Class", "manufactureYear": 2022, "price": 1599000000, "description": "Xe Mercedes C200 Avantgarde (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-benz-c200-298840j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-benz-c200-298840j.jpg"], "detail": { "engine": "I4", "horsepower": 204, "torque": 300, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "6.6", "seats": 5, "weight": 2265, "dimensions": "4751 x 1890 x 1437 mm" } },
      { "carId": 805, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes C-Class", "manufactureYear": 2022, "price": 1849000000, "description": "Xe Mercedes C200 Avantgarde Plus (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-benz-c200-avantgarde-plus-306782j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-benz-c200-avantgarde-plus-306782j.jpg"], "detail": { "engine": "I4", "horsepower": 204, "torque": 300, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "6.6", "seats": 5, "weight": 2265, "dimensions": "4751 x 1890 x 1437 mm" } },
      { "carId": 251, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes C-Class", "manufactureYear": 2022, "price": 2099000000, "description": "Xe Mercedes C300 AMG (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-amg-c300-306811j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-amg-c300-306811j.jpg"], "detail": { "engine": "I4 2.0L", "horsepower": 258, "torque": 400, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "9.07", "seats": 5, "weight": 2135, "dimensions": "4751 x 1890 x 1438 mm" } },
      { "carId": 776, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes C-Class", "manufactureYear": 2022, "price": 2389000000, "description": "Xe Mercedes C300 AMG First Edition (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-amg-c300-first-edition-298888j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-amg-c300-first-edition-298888j.jpg"], "detail": { "engine": "I4 2.0L", "horsepower": 258, "torque": 400, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "9.07", "seats": 5, "weight": 2135, "dimensions": "4751 x 1890 x 1438 mm" } },
      { "carId": 908, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes C-Class", "manufactureYear": 2023, "price": 2960000000, "description": "Xe Mercedes-AMG C43 4Matic (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-amg-c43-4matic-321700j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-amg-c43-4matic-321700j.jpg"], "detail": { "engine": "2.0L", "horsepower": 402, "torque": 500, "transmission": "Tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "0", "seats": 5, "weight": 0, "dimensions": "4791 x 1890 x 1450 mm" } },
      { "carId": 536, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes E-Class", "manufactureYear": 2022, "price": 2159000000, "description": "Xe Mercedes E180 (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-benz-e180-299830j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-benz-e180-299830j.jpg"], "detail": { "engine": "I4 1.5L", "horsepower": 156, "torque": 250, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "8.05", "seats": 5, "weight": 2295, "dimensions": "4940 x 1860 x 1460 mm" } },
      { "carId": 1590, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes E-Class", "manufactureYear": 2025, "price": 2449000000, "description": "Xe Mercedes E200 Avangarde (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-e200-avangarde-345321j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-e200-avangarde-345321j.jpg"], "detail": { "engine": "I4", "horsepower": 197, "torque": 320, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "8.83", "seats": 5, "weight": 2245, "dimensions": "4930 x 1852 x 1468 mm" } },
      { "carId": 519, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes E-Class", "manufactureYear": 2025, "price": 2589000000, "description": "Xe Mercedes E200 Exclusive (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-benz-e200-exclusive-345335j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-benz-e200-exclusive-345335j.jpg"], "detail": { "engine": "I4", "horsepower": 197, "torque": 320, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "8.83", "seats": 5, "weight": 2245, "dimensions": "4930 x 1852 x 1468 mm" } },
      { "carId": 242, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes E-Class", "manufactureYear": 2025, "price": 3209000000, "description": "Xe Mercedes E300 AMG (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-amg-e300-345311j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-amg-e300-345311j.jpg"], "detail": { "engine": "I4", "horsepower": 258, "torque": 370, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "8.71", "seats": 5, "weight": 2380, "dimensions": "4950 x 1852 x 1460 mm" } },
      { "carId": 810, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes S-Class", "manufactureYear": 2022, "price": 5559000000, "description": "Xe Mercedes S450 4MATIC Luxury (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-s450-4matic-luxury-301649j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-s450-4matic-luxury-301649j.jpg"], "detail": { "engine": "V6", "horsepower": 367, "torque": 500, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "0", "seats": 5, "weight": 2760, "dimensions": "5300 x 1937 x 1503 mm" } },
      { "carId": 351, "brand": "MERCEDES", "category": "SEDAN", "model": "Mercedes-Maybach S-Class", "manufactureYear": 2022, "price": 8199000000, "description": "Xe Mercedes-Maybach S450 4MATIC (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-maybach-s450-4matic-302396j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-maybach-s450-4matic-302396j.jpg"], "detail": { "engine": "V6", "horsepower": 367, "torque": 500, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "8.9", "seats": 4, "weight": 2785, "dimensions": "5469 x 1956 x 1510 mm" } },
      { "carId": 811, "brand": "MERCEDES", "category": "SUV", "model": "Mercedes-Maybach S-Class", "manufactureYear": 2022, "price": 15990000000, "description": "Xe Mercedes-Maybach S680 4Matic (Máy Xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-maybach-s-680-4matic-301905j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-maybach-s-680-4matic-301905j.jpg"], "detail": { "engine": "V12", "horsepower": 612, "torque": 900, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "10.67", "seats": 4, "weight": 3000, "dimensions": "5469 x 1956 x 1510 mm" } },
      { "carId": 514, "brand": "MERCEDES", "category": "SUV", "model": "Mercedes GLC", "manufactureYear": 2023, "price": 2299000000, "description": "Xe Mercedes GLC 200 4Matic (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-benz-glc-200-4matic-308456j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-benz-glc-200-4matic-308456j.jpg"], "detail": { "engine": "I4", "horsepower": 197, "torque": 320, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "10.8", "seats": 5, "weight": 2510, "dimensions": "4730 x 1935 x 1658 mm" } },
      { "carId": 267, "brand": "MERCEDES", "category": "SUV", "model": "Mercedes GLC", "manufactureYear": 2023, "price": 2799000000, "description": "Xe Mercedes GLC 300 4Matic (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-benz-glc-300-4matic-308494j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-benz-glc-300-4matic-308494j.jpg"], "detail": { "engine": "I4", "horsepower": 258, "torque": 400, "transmission": "Số tự động 9 cấp", "fuelType": "Xăng", "fuelConsumption": "10.48", "seats": 5, "weight": 2510, "dimensions": "4730 x 1935 x 1640 mm" } },
      { "carId": 357, "brand": "MERCEDES", "category": "SUV", "model": "Mercedes G-Class", "manufactureYear": 2022, "price": 11750000000, "description": "Xe Mercedes-AMG G63 (Máy xăng) chính chủ.", "quantity": 10, "soldQuantity": 0, "colors": ["WHITE", "BLACK", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.dailyxe.com.vn/image/mercedes-amg-g63-302303j15.jpg", "https://cdn.dailyxe.com.vn/image/mercedes-amg-g63-302303j.jpg"], "detail": { "engine": "V8", "horsepower": 585, "torque": 850, "transmission": "Số tự động 7 cấp", "fuelType": "Xăng", "fuelConsumption": "8.15", "seats": 5, "weight": 3200, "dimensions": "4873 x 1984 x 1966 mm" } }
    ]
    """;

    // ==========================================
    // DỮ LIỆU VINFAST (5 xe - Đầy đủ ảnh & Thông số)
    // ==========================================
    private static final String VINFAST_JSON = """
    [
      { "carId": 173050196, "brand": "VINFAST", "category": "SUV", "model": "VF6 Eco", "manufactureYear": 2025, "price": 630000000, "description": "Ô tô điện VinFast VF6 Eco mới, thiết kế hiện đại, vận hành êm ái.", "quantity": 10, "soldQuantity": 2, "colors": ["WHITE", "BLUE", "SILVER"], "status": "AVAILABLE", "imageUrls": ["https://cdn.chotot.com/f-aok_1XRtbLzNDw26COThXgTtLaf4fkumEN2piysHI/preset:view/plain/6f57c639037c5e5f3c30b1bf2559b2a8-2963070170500638772.jpg", "https://cdn.chotot.com/VFV9972QgON1yqB9eWFWv6mVb8U-i_kYk0eqlbtjNwY/preset:view/plain/aeb2e6f429690c96ae1f56fda8164fd0-2963070170606284348.jpg", "https://cdn.chotot.com/jWqNLb4TY8fg6UNVN_dWFJ99Ljnai9Buci_kC-_g_m4/preset:view/plain/d582da6e86f770b447431f0497b9fc7b-2963070170766462866.jpg"], "detail": { "engine": "Electric Motor 130kW", "horsepower": 174, "torque": 250, "transmission": "Tự động", "fuelType": "Điện", "fuelConsumption": "0", "seats": 5, "weight": 1800.0, "dimensions": "4238 x 1820 x 1594 mm" } },
      { "carId": 172953649, "brand": "VINFAST", "category": "SUV", "model": "VF5 Plus", "manufactureYear": 2025, "price": 529000000, "description": "Mẫu SUV điện cỡ A năng động, hỗ trợ vay 90%, miễn phí sạc pin.", "quantity": 15, "soldQuantity": 5, "colors": ["ORANGE", "WHITE", "BLUE"], "status": "AVAILABLE", "imageUrls": ["https://cdn.chotot.com/1vZ7vJ6Y_hWI9HsAUR-MjWYG0L_skJfpYZ0LQYh_Fjo/preset:view/plain/45a84d98aa2a786ae5df5809fcd2b5f1-2962498279161495518.jpg", "https://cdn.chotot.com/rGeRABsIE634OqKgYMcbK_pgOP2KfKbd4H5Sz-tGjsk/preset:view/plain/a6ba99c7d7ced7e1c1a4e927a6db201a-2962498274925020990.jpg", "https://cdn.chotot.com/KHkxvQTAeUE28P6cBpypMSBWEOziTeT3KPH-JI-kncQ/preset:view/plain/b2725e97ec401732b9f3eeaa82bc35cd-2962498272374818622.jpg"], "detail": { "engine": "Electric Motor 100kW", "horsepower": 134, "torque": 135, "transmission": "Tự động", "fuelType": "Điện", "fuelConsumption": "0", "seats": 5, "weight": 1360.0, "dimensions": "3965 x 1720 x 1580 mm" } },
      { "carId": 172953496, "brand": "VINFAST", "category": "SUV", "model": "VF7 Plus", "manufactureYear": 2025, "price": 799000000, "description": "SUV điện phân khúc C, công suất mạnh mẽ, thiết kế thời thượng.", "quantity": 5, "soldQuantity": 1, "colors": ["GRAY", "BLACK", "WHITE"], "status": "AVAILABLE", "imageUrls": ["https://cdn.chotot.com/S20iSl6yAsZDl9aoD05HaN1HJf6hqxGRUMm5aPJpzek/preset:view/plain/a1c482047d2e721c9b412d688a80abc9-2962497848220611843.jpg", "https://cdn.chotot.com/gZPPQEL6AmHsrkXb4Fn_2Opms_Xz9m1hWP4nh_ecWhE/preset:view/plain/f1585650f008ba3c58bc18fa30be3169-2962497855982252988.jpg", "https://cdn.chotot.com/JI9-72XdJYdEuffhO4YUuBzquocWjs3oCeJ33tPYlSM/preset:view/plain/64721ff1c2aeda83a4a036c072ea5bda-2962497863481734076.jpg"], "detail": { "engine": "Dual Motor 260kW", "horsepower": 349, "torque": 500, "transmission": "Tự động (AWD)", "fuelType": "Điện", "fuelConsumption": "0", "seats": 5, "weight": 2100.0, "dimensions": "4545 x 1890 x 1635 mm" } },
      { "carId": 172953196, "brand": "VINFAST", "category": "SUV", "model": "VF3 Standard", "manufactureYear": 2025, "price": 299000000, "description": "Xe điện mini đô thị, cá tính, chi phí vận hành siêu rẻ.", "quantity": 20, "soldQuantity": 8, "colors": ["YELLOW", "GREEN", "BROWN"], "status": "AVAILABLE", "imageUrls": ["https://cdn.chotot.com/lWdZ7SFb6p3_eBmYkMAU8tlV2XB6Kj5Sr9dA80NW-H0/preset:view/plain/8d72dcae9b77a153d67e5939f9c06fe5-2962497053950784444.jpg", "https://cdn.chotot.com/rzraK8X3qJZHTi2EKOqpUXlN9OBfn4iat1G6KmwvKEM/preset:view/plain/78d339010255561901f2932664d7c283-2962497070191826559.jpg", "https://cdn.chotot.com/-4ZtW0qbWOzPFWVycUdSH-T-GHwaNKGcc0GzvWXLx-I/preset:view/plain/9b8e5b3bf2e7d39eeca8149098225ff8-2962497072406180796.jpg"], "detail": { "engine": "Electric Motor 32kW", "horsepower": 43, "torque": 110, "transmission": "Tự động", "fuelType": "Điện", "fuelConsumption": "0", "seats": 4, "weight": 850.0, "dimensions": "3190 x 1679 x 1622 mm" } },
      { "carId": 168387831, "brand": "VINFAST", "category": "SUV", "model": "Lux SA2.0 Plus", "manufactureYear": 2020, "price": 625000000, "description": "SUV 7 chỗ đẳng cấp, khung gầm Đức, động cơ Turbo mạnh mẽ.", "quantity": 3, "soldQuantity": 1, "colors": ["BLACK", "SILVER", "RED"], "status": "AVAILABLE", "imageUrls": ["https://cdn.chotot.com/_mCcSepvVfFgrg829R0qF4XmbJpPU6ljxlzNEoZ3CaU/preset:view/plain/bf6617f35864303bcff457ef7cb83e78-2936251177789679033.jpg", "https://cdn.chotot.com/gQfi5PQ7Sy2nbCdJ7bQMiwGQdrX4IJPoW9LQXTGTK7o/preset:view/plain/cf1c15e7b85fb9f7bdeab58f305b3345-2936251177761617228.jpg", "https://cdn.chotot.com/tzbgT1NcZ0wgslAJMF_ze2nGmj5Z9SgY2gh75NO9clg/preset:view/plain/77b93bcf38a4dff2ab40005ab21606ee-2936251177969128055.jpg"], "detail": { "engine": "2.0L Turbo Gasoline", "horsepower": 228, "torque": 350, "transmission": "Tự động 8 cấp ZF", "fuelType": "Xăng", "fuelConsumption": "0", "seats": 7, "weight": 2140.0, "dimensions": "4940 x 1960 x 1773 mm" } }
    ]
    """;
}