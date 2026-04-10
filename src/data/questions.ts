export interface Question {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
}

export const questions: Question[] = [
  {
    id: 1,
    question: "Các yếu tố cần cho sự sống và phát triển của thực vật là:",
    options: [
      "Ánh sáng, không khí, nước, chất khoáng và cây giống.",
      "Ánh sáng, không khí, nước, chất khoáng và nhiệt độ",
      "Ánh sáng, không khí, nước, chất khoáng và người chăm sóc.",
      "Ánh sáng, không khí, nước, chất khoáng"
    ],
    answerIndex: 1
  },
  {
    id: 2,
    question: "Phát biểu nào sau đây là ĐÚNG về động vật?",
    options: [
      "Động vật không có khả năng tự tổng hợp chất dinh dưỡng.",
      "Trong quá trình trao đổi chất, động vật thải ra môi trường thức ăn, nước uống.",
      "Động vật có thể tự tổng hợp chất dinh dưỡng như thực vật.",
      "Động vật không cần thải chất bã ra môi trường."
    ],
    answerIndex: 0
  },
  {
    id: 3,
    question: "Tuỳ theo độ tuổi, trạng thái sinh lí và môi trường sống mà nấm có:",
    options: [
      "Hình dạng, kích thước, màu sắc cố định",
      "Hình dạng, kích thước cố định",
      "Kích thước, màu sắc không cố định",
      "Hình dạng, kích thước, màu sắc không cố định"
    ],
    answerIndex: 3
  },
  {
    id: 4,
    question: "Trong các thức ăn dưới đây, nhóm nào chứa nhiều chất bột đường?",
    options: [
      "Cá, trứng, sữa, thịt, hải sản, đậu nành.",
      "Cơm, bánh mỳ, khoai, sắn.",
      "Bơ, lạc, dầu dừa, cá hồi.",
      "Sữa, hoa quả, rau xanh, cà rốt."
    ],
    answerIndex: 1
  },
  {
    id: 5,
    question: "Đâu KHÔNG phải vai trò của nước đối với cơ thể?",
    options: [
      "Giúp tiêu hóa thức ăn, hòa tan chất dinh dưỡng và bài tiết chất thải.",
      "Giúp làm mát cơ thể khi thoát mồ hôi.",
      "Giúp vận chuyển các chất dinh dưỡng đi khắp cơ thể.",
      "Giúp cơ thể có đầy đủ năng lượng sống."
    ],
    answerIndex: 3
  },
  {
    id: 6,
    question: "Mỗi sinh vật trong chuỗi thức ăn được gọi là gì?",
    options: [
      "Một mắt xích",
      "Một nguồn thức ăn",
      "Một vật chủ",
      "Một mắt xích quan trọng"
    ],
    answerIndex: 0
  },
  {
    id: 7,
    question: "Thực vật dùng năng lượng ánh sáng mặt trời để làm gì?",
    options: [
      "Trao đổi chất",
      "Tổng hợp các chất hữu cơ từ các chất vô cơ",
      "Hô hấp",
      "Quang hợp"
    ],
    answerIndex: 3
  },
  {
    id: 8,
    question: "Tại sao không nên ăn đồ ăn đã hết hạn sử dụng?",
    options: [
      "Vì có thể bị nhiễm khuẩn, nấm mốc gây hại cho sức khỏe.",
      "Vì đồ ăn sẽ không còn ngon nữa.",
      "Vì đồ ăn đã mất hết giá trị dinh dưỡng.",
      "Cả 3 phương án trên đều đúng."
    ],
    answerIndex: 0
  },
  {
    id: 9,
    question: "Đâu không thể là mắt xích liền sau của con gà?",
    options: [
      "Con vịt",
      "Con hổ",
      "Con báo",
      "Con sư tử"
    ],
    answerIndex: 0
  },
  {
    id: 10,
    question: "Vì sao chim di cư vào mùa đông?",
    options: [
      "Vì muốn khám phá các vùng đất mới",
      "Vì nhiệt độ thấp và thiếu thức ăn ở nơi cư trú cũ",
      "Vì muốn tránh những loài săn mồi",
      "Vì ánh sáng ban ngày ngắn hơn"
    ],
    answerIndex: 1
  },
  {
    id: 11,
    question: "Cây sẽ thế nào nếu không được tưới nước?",
    options: [
      "Cây sẽ di chuyển đến nơi có nước",
      "Cây sẽ phát triển tốt và mạnh khỏe",
      "Cây sẽ héo và cuối cùng sẽ chết",
      "Cây vẫn bình thường"
    ],
    answerIndex: 2
  },
  {
    id: 12,
    question: "Phát biểu nào sau đây là SAI?",
    options: [
      "Động vật lấy thức ăn từ không khí.",
      "Động vật lấy thức ăn từ cả thực vật và động vật.",
      "Động vật cần nước để duy trì sự sống.",
      "Động vật không thể tự tổng hợp chất hữu cơ."
    ],
    answerIndex: 0
  },
  {
    id: 13,
    question: "Nấm có thể sống ở đâu?",
    options: [
      "Đất ẩm",
      "Rơm rạ mục",
      "Thức ăn",
      "Cả 3 phương án trên đều đúng"
    ],
    answerIndex: 3
  },
  {
    id: 14,
    question: "Trong các thức ăn dưới đây, nhóm chất nào chứa nhiều chất đạm?",
    options: [
      "Cá, trứng, sữa, thịt, hải sản, đậu nành.",
      "Cơm, bánh mỳ, khoai, sắn.",
      "Bơ, lạc, dầu dừa, cá hồi.",
      "Sữa, hoa quả, rau xanh, cà rốt."
    ],
    answerIndex: 0
  },
  {
    id: 15,
    question: "Ca-lo và ki-lô-ca-lo là đơn vị dùng để làm gì?",
    options: [
      "Đo độ dài.",
      "Đo chiều cao.",
      "Đo năng lượng mà thức ăn cung cấp.",
      "Đo khối lượng của thức ăn."
    ],
    answerIndex: 2
  },
  {
    id: 16,
    question: "Cây xanh cần những yếu tố nào để sống và phát triển (quang hợp)?",
    options: [
      "Ánh sáng, nước và không khí",
      "Thức ăn và nước uống",
      "Đất và nhiệt độ cao",
      "Phân bón và bóng tối"
    ],
    answerIndex: 0
  },
  {
    id: 17,
    question: "Thí nghiệm đặt cây đậu trong phòng tối nhằm chứng minh điều gì?",
    options: [
      "Cây cần nước",
      "Cây cần ánh sáng",
      "Cây cần chất khoáng",
      "Cây cần không khí"
    ],
    answerIndex: 1
  },
  {
    id: 18,
    question: "Tại sao không nên ăn khoai tây đã mọc mầm?",
    options: [
      "Khoai tây mọc mầm không còn ngon.",
      "Khoai tây đã mọc mầm chứa độc tố.",
      "Khoai tây mọc mầm mất hết chất dinh dưỡng.",
      "Khoai tây mọc mầm đã bị nhiễm khuẩn."
    ],
    answerIndex: 1
  },
  {
    id: 19,
    question: "Chuỗi thức ăn nào sau đây mô tả chính xác mối quan hệ giữa khoai tây, chuột và rắn?",
    options: [
      "Khoai tây → chuột → rắn.",
      "Rắn → chuột → khoai tây.",
      "Khoai tây → rắn → chuột.",
      "Chuột → rắn → khoai tây."
    ],
    answerIndex: 0
  },
  {
    id: 20,
    question: "Khi nuôi cá trong bể kính, nếu cá nổi đầu lên mặt nước thì nguyên nhân là gì?",
    options: [
      "Thiếu thức ăn",
      "Nước thiếu oxi",
      "Nhiệt độ nước quá lạnh",
      "Nước quá trong"
    ],
    answerIndex: 1
  },
  {
    id: 21,
    question: "Trong quá trình hô hấp, thực vật hấp thụ khí nào?",
    options: [
      "Khí các-bô-níc",
      "Khí ni-tơ",
      "Khí ô-xi",
      "Tất cả các khí trên"
    ],
    answerIndex: 2
  },
  {
    id: 22,
    question: "Phát biểu nào sau đây là ĐÚNG về nhu cầu của động vật?",
    options: [
      "Động vật cần thức ăn, nước, nhiệt độ và ánh sáng thích hợp.",
      "Động vật chỉ cần thức ăn để sống.",
      "Động vật không cần ánh sáng.",
      "Động vật có thể sống thiếu nước thời gian dài."
    ],
    answerIndex: 0
  },
  {
    id: 23,
    question: "Nấm rơm thường có thể sống ở đâu?",
    options: [
      "Đất ẩm",
      "Rơm, rạ mục",
      "Thức ăn",
      "Hoa quả"
    ],
    answerIndex: 1
  },
  {
    id: 24,
    question: "Trong các thức ăn dưới đây, nhóm chất nào chứa nhiều chất béo?",
    options: [
      "Sữa, rau dền, khoai tây, hàu, trứng.",
      "Cơm, bánh mỳ, khoai, sắn.",
      "Bơ, lạc, dầu dừa, cá hồi.",
      "Sữa, hoa quả, rau xanh, cà rốt."
    ],
    answerIndex: 2
  },
  {
    id: 25,
    question: "Vai trò của can-xi đối với cơ thể là gì?",
    options: [
      "Giúp săn chắc các cơ.",
      "Chống táo bón.",
      "Tăng cường trí nhớ.",
      "Giúp xương chắc khỏe."
    ],
    answerIndex: 3
  },
  {
    id: 26,
    question: "Nơi sinh vật sống được gọi là gì?",
    options: [
      "Môi trường sống",
      "Hệ sinh thái",
      "Vùng lãnh thổ",
      "Khu bảo tồn"
    ],
    answerIndex: 0
  },
  {
    id: 27,
    question: "Để giúp vật nuôi khỏe mạnh, lớn nhanh, chúng ta cần làm gì?",
    options: [
      "Nhốt vật nuôi trong chuồng kín khi trời nóng.",
      "Tự mua thuốc cho vật nuôi uống khi bị bệnh.",
      "Giữ vệ sinh chuồng trại sạch sẽ và cho ăn uống đầy đủ.",
      "Hạn chế cho vật nuôi uống nước."
    ],
    answerIndex: 2
  },
  {
    id: 28,
    question: "Tại sao không nên ăn thức ăn có nấm mốc?",
    options: [
      "Thức ăn có nấm mốc gây ngộ độc thực phẩm.",
      "Thức ăn có nấm mốc tăng thêm mùi vị.",
      "Thức ăn có nấm mốc mất đi sự bắt mắt.",
      "Tất cả các đáp án trên."
    ],
    answerIndex: 0
  },
  {
    id: 29,
    question: "Dế mèn là thức ăn của gà, gà là thức ăn của cáo. Chuỗi thức ăn nào đúng?",
    options: [
      "Gà → dế mèn → Cáo.",
      "Cáo → dế mèn → gà.",
      "Dế mèn → gà → cáo.",
      "Cáo → gà → dế mèn."
    ],
    answerIndex: 2
  },
  {
    id: 30,
    question: "Trong quá trình quang hợp, thực vật thải ra khí gì?",
    options: [
      "Nước",
      "Khí các-bô-níc",
      "Khí ô-xi",
      "Khí ni-tơ"
    ],
    answerIndex: 2
  },
  {
    id: 31,
    question: "Để cây trồng sống và phát triển tốt, cần chăm sóc như thế nào?",
    options: [
      "Làm đất tơi xốp, thoáng khí.",
      "Tưới nước, bón phân đầy đủ.",
      "Chống nóng, chống rét cho cây.",
      "Cả 3 phương án trên đều đúng."
    ],
    answerIndex: 3
  },
  {
    id: 32,
    question: "Phát biểu nào sau đây là ĐÚNG?",
    options: [
      "Nhu cầu thức ăn của các loài động vật khác nhau.",
      "Không thể xác định nhu cầu thức ăn của động vật.",
      "Tất cả động vật đều ăn cùng một loại thức ăn.",
      "Động vật không cần thay đổi thức ăn theo độ tuổi."
    ],
    answerIndex: 0
  },
  {
    id: 33,
    question: "Nấm mốc có thể sống ở đâu?",
    options: [
      "Đất ẩm",
      "Rơm, rạ mục",
      "Thức ăn",
      "Gỗ mục"
    ],
    answerIndex: 2
  },
  {
    id: 34,
    question: "Trong các thức ăn dưới đây, nhóm chất nào chứa nhiều chất khoáng?",
    options: [
      "Sữa, rau dền, khoai tây, hàu, trứng.",
      "Cơm, bánh mỳ, khoai, sắn.",
      "Bơ, lạc, dầu dừa, cá hồi.",
      "Sữa, hoa quả, rau xanh, cà rốt."
    ],
    answerIndex: 0
  },
  {
    id: 35,
    question: "Vai trò của chất xơ đối với cơ thể là gì?",
    options: [
      "Giúp dạ dày co bóp mạnh hơn.",
      "Cung cấp chất xơ, nhanh no và phòng tránh táo bón.",
      "Bổ mắt, răng, lợi khỏe mạnh.",
      "Cung cấp năng lượng."
    ],
    answerIndex: 1
  },
  {
    id: 36,
    question: "Nhóm nào sau đây đều là thực vật?",
    options: [
      "Gà, mèo, chó",
      "Cây lúa, cây ngô, cây đậu",
      "Nấm rơm, nấm mốc",
      "Con dê, con hổ"
    ],
    answerIndex: 1
  },
  {
    id: 37,
    question: "Động vật nào sau đây chỉ ăn thực vật?",
    options: [
      "Con dê",
      "Chim đại bàng",
      "Hổ",
      "Cá sấu"
    ],
    answerIndex: 0
  },
  {
    id: 38,
    question: "Tại sao khi thức ăn bị nhiễm nấm mốc, ta nên bỏ hoàn toàn?",
    options: [
      "Nấm mốc tạo ra độc tố lan tỏa trong toàn bộ thực phẩm.",
      "Có những phần nấm mốc không thể nhìn được bằng mắt thường.",
      "Phần chưa nhiễm nấm mốc không còn mùi vị ngon.",
      "Cả a và b đều đúng"
    ],
    answerIndex: 3
  },
  {
    id: 39,
    question: "Sơ đồ chuỗi thức ăn nào sau đây là đúng?",
    options: [
      "Lá cây → Châu chấu → Rắn.",
      "Rắn → Châu chấu → Rắn → Ếch",
      "Lá cây → Châu chấu → Ếch → Rắn",
      "Châu chấu → Ếch → Rắn"
    ],
    answerIndex: 2
  },
  {
    id: 40,
    question: "Vì sao phải thay một phần nước định kỳ trong môi trường nuôi thủy sản?",
    options: [
      "Để làm sạch bùn dưới đáy ao",
      "Để duy trì nồng độ oxi và giảm chất độc tích tụ",
      "Để tăng nhiệt độ nước",
      "Để tăng tốc độ sinh sản của cá"
    ],
    answerIndex: 1
  },
  {
    id: 41,
    question: "Việc cho vật nuôi ăn giúp ích gì?",
    options: [
      "Cung cấp dinh dưỡng cho vật nuôi",
      "Hạn chế bệnh, giữ gìn và tăng cường sức khỏe",
      "Giữ ấm cho vật nuôi",
      "Cung cấp nước cho vật nuôi"
    ],
    answerIndex: 0
  },
  {
    id: 42,
    question: "Phát biểu nào sau đây là ĐÚNG?",
    options: [
      "Cây trồng ở nơi thiếu ánh sáng sẽ mọc vươn cao hơn và yếu hơn.",
      "Chỉ cần tưới nước buổi tối là đủ vì cây không cần nước ban ngày.",
      "Cây không cần ánh sáng để phát triển.",
      "Cây mọc trong bóng tối sẽ khỏe mạnh hơn."
    ],
    answerIndex: 0
  },
  {
    id: 43,
    question: "Nấm men thường sống ở đâu?",
    options: [
      "Trái cây",
      "Dạ dày",
      "Da của động vật",
      "Tất cả các phương án trên"
    ],
    answerIndex: 3
  },
  {
    id: 44,
    question: "Trong các thức ăn dưới đây, nhóm nào chứa nhiều vi-ta-min?",
    options: [
      "Sữa, rau dền, khoai tây, hàu, trứng.",
      "Cơm, bánh mỳ, khoai, sắn.",
      "Bơ, lạc, dầu dừa, cá hồi.",
      "Sữa, hoa quả, rau xanh, cà rốt."
    ],
    answerIndex: 3
  },
  {
    id: 45,
    question: "Vai trò của vi-ta-min (A, B1, C,...) đối với cơ thể là gì?",
    options: [
      "Giúp dạ dày co bóp mạnh hơn.",
      "Cung cấp chất xơ, nhanh no và phòng tránh táo bón.",
      "Giúp mắt, răng, lợi, da,... khỏe mạnh.",
      "Cung cấp năng lượng."
    ],
    answerIndex: 2
  },
  {
    id: 46,
    question: "Phát biểu nào sau đây là ĐÚNG?",
    options: [
      "Con người, động vật và thực vật đều là sinh vật.",
      "Sinh vật không cần môi trường sạch để sống.",
      "Thực vật không phải là sinh vật.",
      "Chỉ con người mới cần ăn uống để sống."
    ],
    answerIndex: 0
  },
  {
    id: 47,
    question: "Động vật nào sau đây vừa ăn thực vật vừa ăn động vật?",
    options: [
      "Chim đại bàng",
      "Bò",
      "Ngựa",
      "Vịt"
    ],
    answerIndex: 3
  },
  {
    id: 48,
    question: "Tại sao khi bảo quản nên tách riêng rau củ quả và thực phẩm tươi sống?",
    options: [
      "Vì mỗi nhóm có nhiệt độ và cách thức bảo quản khác nhau.",
      "Vì thực phẩm có thể bị lẫn mùi vị.",
      "Vì thịt, cá có thể lan vi khuẩn sang rau củ, quả.",
      "Cả 3 phương án trên đều đúng."
    ],
    answerIndex: 3
  },
  {
    id: 49,
    question: "Chuỗi thức ăn nào sau đây thể hiện đúng mối quan hệ giữa bắp cải, chim và sâu?",
    options: [
      "Bắp cải → chim → sâu",
      "Bắp cải → sâu → chim",
      "Sâu → bắp cải → chim",
      "Chim → sâu → bắp cải"
    ],
    answerIndex: 1
  }
];
