# Hướng Dẫn Sử Dụng Claude 4.6

## Giới Thiệu

Claude là trợ lý AI tiên tiến được phát triển bởi Anthropic. Phiên bản mới nhất (Claude Opus 4.5 và Claude Sonnet 4.5) cung cấp khả năng xử lý ngôn ngữ tự nhiên mạnh mẽ, lập trình, phân tích dữ liệu và nhiều tác vụ khác.

## Cách Truy Cập Claude

### 1. Qua Trang Web Claude.ai

**Bước 1:** Truy cập [claude.ai](https://claude.ai)

**Bước 2:** Đăng ký hoặc đăng nhập bằng:
- Email
- Tài khoản Google
- Tài khoản SSO (Single Sign-On)

**Bước 3:** Bắt đầu trò chuyện với Claude trực tiếp trong giao diện web

### 2. Qua API (Dành cho Lập Trình Viên)

Claude cung cấp API mạnh mẽ cho phép tích hợp vào ứng dụng của bạn.

#### Cài Đặt

```bash
# Python
pip install anthropic

# Node.js
npm install @anthropic-ai/sdk
```

#### Lấy API Key

1. Truy cập [console.anthropic.com](https://console.anthropic.com)
2. Đăng ký tài khoản nếu chưa có
3. Vào phần "API Keys"
4. Tạo API key mới và lưu lại

#### Ví Dụ Python

```python
import anthropic

# Khởi tạo client
client = anthropic.Anthropic(
    api_key="your-api-key-here"
)

# Gửi tin nhắn
message = client.messages.create(
    model="claude-opus-4-20250514",  # Hoặc "claude-sonnet-4-20250514"
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Xin chào! Bạn có thể giúp tôi không?"}
    ]
)

print(message.content[0].text)
```

#### Ví Dụ Node.js

```javascript
import Anthropic from '@anthropic-ai/sdk';

// Khởi tạo client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Gửi tin nhắn
const message = await client.messages.create({
  model: 'claude-opus-4-20250514',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Xin chào! Bạn có thể giúp tôi không?' }
  ]
});

console.log(message.content[0].text);
```

## Các Mô Hình Claude

### Claude Opus 4.5
- Model ID: `claude-opus-4-20250514`
- **Mạnh nhất**: Phù hợp cho các tác vụ phức tạp nhất
- Khả năng phân tích sâu, sáng tạo nội dung chất lượng cao
- Xử lý code phức tạp, toán học nâng cao

### Claude Sonnet 4.5
- Model ID: `claude-sonnet-4-20250514`
- **Cân bằng tốt nhất**: Hiệu suất cao với chi phí hợp lý
- Phù hợp cho hầu hết các ứng dụng thực tế
- Xử lý nhanh với chất lượng tốt

### Claude Haiku
- Model ID: `claude-haiku-4-20250115`
- **Nhanh nhất**: Phản hồi tức thì
- Phù hợp cho các tác vụ đơn giản, chatbot, phân loại văn bản

## Tính Năng Nổi Bật

### 1. Cửa Sổ Context Lớn
- Hỗ trợ lên đến 200,000 tokens
- Xử lý tài liệu dài, nhiều file code cùng lúc
- Nhớ toàn bộ cuộc hội thoại

### 2. Vision (Nhận Diện Hình Ảnh)
```python
message = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": base64_image
                    }
                },
                {
                    "type": "text",
                    "text": "Mô tả hình ảnh này"
                }
            ]
        }
    ]
)
```

### 3. Tool Use (Gọi Hàm)
```python
tools = [
    {
        "name": "get_weather",
        "description": "Lấy thông tin thời tiết",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "Tên thành phố"
                }
            },
            "required": ["location"]
        }
    }
]

message = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=[
        {"role": "user", "content": "Thời tiết ở Hà Nội như thế nào?"}
    ]
)
```

### 4. Streaming
```python
with client.messages.stream(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Viết một câu chuyện ngắn"}
    ]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## Use Cases Phổ Biến

### 1. Lập Trình
- Viết code
- Debug và fix lỗi
- Code review
- Giải thích code
- Refactoring

### 2. Phân Tích Dữ Liệu
- Phân tích văn bản
- Tóm tắt tài liệu
- Trích xuất thông tin
- Sentiment analysis

### 3. Sáng Tạo Nội Dung
- Viết bài blog, article
- Dịch thuật
- Viết email chuyên nghiệp
- Brainstorming ý tưởng

### 4. Giáo Dục
- Giải thích khái niệm phức tạp
- Tạo bài tập
- Hướng dẫn học tập
- Gia sư cá nhân

### 5. Doanh Nghiệp
- Customer support chatbot
- Tự động hóa quy trình
- Phân tích báo cáo
- Tạo tài liệu

## Best Practices

### 1. Prompt Engineering
- **Rõ ràng và cụ thể**: Mô tả chính xác những gì bạn muốn
- **Cung cấp context**: Càng nhiều thông tin càng tốt
- **Sử dụng examples**: Đưa ra ví dụ về output mong muốn
- **System prompts**: Sử dụng để định hướng hành vi của Claude

```python
message = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    system="Bạn là một chuyên gia lập trình Python với 10 năm kinh nghiệm.",
    messages=[
        {"role": "user", "content": "Giải thích list comprehension"}
    ]
)
```

### 2. Xử Lý Lỗi
```python
from anthropic import APIError, RateLimitError

try:
    message = client.messages.create(...)
except RateLimitError:
    print("Đã vượt quá giới hạn request")
except APIError as e:
    print(f"Lỗi API: {e}")
```

### 3. Tối Ưu Chi Phí
- Sử dụng model phù hợp với tác vụ (Haiku cho đơn giản, Opus cho phức tạp)
- Giới hạn `max_tokens` hợp lý
- Cache system prompts cho các request lặp lại
- Sử dụng Prompt Caching

### 4. Bảo Mật
- **KHÔNG** hard-code API key trong code
- Sử dụng environment variables
- Rotate API keys định kỳ
- Giới hạn permissions

```python
import os
from anthropic import Anthropic

client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)
```

## Giá Cả

Tính phí theo số tokens:
- **Input tokens**: Văn bản bạn gửi cho Claude
- **Output tokens**: Văn bản Claude trả về

Xem chi tiết giá tại: [anthropic.com/pricing](https://www.anthropic.com/pricing)

## Giới Hạn

### Rate Limits
- Phụ thuộc vào plan của bạn (Free, Pro, Team, Enterprise)
- Đo bằng: Requests per minute (RPM) và Tokens per minute (TPM)

### Context Window
- Tối đa 200,000 tokens cho input
- Tính cả lịch sử conversation

### Output
- Max output tokens có thể cấu hình
- Thường từ 1024 đến 8192 tokens

## Tài Nguyên Học Tập

- **Documentation**: [docs.anthropic.com](https://docs.anthropic.com)
- **API Reference**: [docs.anthropic.com/claude/reference](https://docs.anthropic.com/claude/reference)
- **Cookbook**: [github.com/anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook)
- **Discord Community**: Tham gia cộng đồng Anthropic
- **Support**: support@anthropic.com

## Ví Dụ Tích Hợp Vào MovieTheater

### Chatbot Hỗ Trợ Khách Hàng

```python
import anthropic
import os

class MovieTheaterAssistant:
    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )
        self.conversation_history = []

    def chat(self, user_message):
        # Thêm tin nhắn user vào lịch sử
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # Gọi Claude API
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system="""Bạn là trợ lý AI cho hệ thống rạp chiếu phim MovieTheater.
            Nhiệm vụ của bạn là:
            - Giúp khách hàng tìm phim phù hợp
            - Trả lời câu hỏi về lịch chiếu
            - Hỗ trợ đặt vé
            - Cung cấp thông tin về rạp
            Hãy thân thiện, chuyên nghiệp và hữu ích.""",
            messages=self.conversation_history
        )

        # Lấy response và thêm vào lịch sử
        assistant_message = response.content[0].text
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })

        return assistant_message

# Sử dụng
assistant = MovieTheaterAssistant()
response = assistant.chat("Có phim gì hay đang chiếu?")
print(response)
```

### Phân Tích Review Phim

```python
def analyze_movie_reviews(reviews):
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    reviews_text = "\n\n".join([f"Review {i+1}: {review}" for i, review in enumerate(reviews)])

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": f"""Phân tích các review phim sau và tóm tắt:
                - Sentiment tổng thể (tích cực/tiêu cực/trung lập)
                - Điểm nổi bật được nhắc đến nhiều
                - Điểm yếu được phàn nàn
                - Đánh giá trung bình (1-5 sao)

                Reviews:
                {reviews_text}
                """
            }
        ]
    )

    return message.content[0].text

# Ví dụ
reviews = [
    "Phim hay, diễn xuất tốt nhưng hơi dài",
    "Tuyệt vời! Đáng xem, hiệu ứng đẹp",
    "Không hay lắm, cốt truyện nhạt nhẽo"
]

analysis = analyze_movie_reviews(reviews)
print(analysis)
```

## Kết Luận

Claude 4.6 (Opus 4.5 / Sonnet 4.5) là công cụ AI mạnh mẽ có thể tích hợp vào nhiều loại ứng dụng. Với hướng dẫn này, bạn có thể bắt đầu sử dụng Claude cho dự án của mình.

**Bước tiếp theo:**
1. Đăng ký tài khoản tại claude.ai hoặc console.anthropic.com
2. Lấy API key
3. Cài đặt SDK
4. Thử nghiệm với các ví dụ trong hướng dẫn
5. Tích hợp vào ứng dụng của bạn

Chúc bạn thành công! 🚀
