# How to Use Claude 4.6

## Introduction

Claude is an advanced AI assistant developed by Anthropic. The latest versions (Claude Opus 4.5 and Claude Sonnet 4.5) provide powerful natural language processing, programming, data analysis, and many other capabilities.

## Accessing Claude

### 1. Via Claude.ai Website

**Step 1:** Visit [claude.ai](https://claude.ai)

**Step 2:** Sign up or log in using:
- Email
- Google account
- SSO (Single Sign-On)

**Step 3:** Start chatting with Claude directly in the web interface

### 2. Via API (For Developers)

Claude provides a powerful API for integrating into your applications.

#### Installation

```bash
# Python
pip install anthropic

# Node.js
npm install @anthropic-ai/sdk
```

#### Get API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up if you don't have an account
3. Go to "API Keys" section
4. Create a new API key and save it

#### Python Example

```python
import anthropic

# Initialize client
client = anthropic.Anthropic(
    api_key="your-api-key-here"
)

# Send message
message = client.messages.create(
    model="claude-opus-4-20250514",  # Or "claude-sonnet-4-20250514"
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello! Can you help me?"}
    ]
)

print(message.content[0].text)
```

#### Node.js Example

```javascript
import Anthropic from '@anthropic-ai/sdk';

// Initialize client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Send message
const message = await client.messages.create({
  model: 'claude-opus-4-20250514',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'Hello! Can you help me?' }
  ]
});

console.log(message.content[0].text);
```

## Claude Models

### Claude Opus 4.5
- Model ID: `claude-opus-4-20250514`
- **Most Powerful**: Best for the most complex tasks
- Deep analysis capabilities, high-quality content creation
- Complex code processing, advanced mathematics

### Claude Sonnet 4.5
- Model ID: `claude-sonnet-4-20250514`
- **Best Balance**: High performance with reasonable cost
- Suitable for most real-world applications
- Fast processing with good quality

### Claude Haiku
- Model ID: `claude-haiku-4-20250115`
- **Fastest**: Instant responses
- Suitable for simple tasks, chatbots, text classification

## Key Features

### 1. Large Context Window
- Supports up to 200,000 tokens
- Process long documents, multiple code files simultaneously
- Remembers entire conversation history

### 2. Vision (Image Recognition)
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
                    "text": "Describe this image"
                }
            ]
        }
    ]
)
```

### 3. Tool Use (Function Calling)
```python
tools = [
    {
        "name": "get_weather",
        "description": "Get weather information",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City name"
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
        {"role": "user", "content": "What's the weather like in Hanoi?"}
    ]
)
```

### 4. Streaming
```python
with client.messages.stream(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Write a short story"}
    ]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## Common Use Cases

### 1. Programming
- Write code
- Debug and fix errors
- Code review
- Explain code
- Refactoring

### 2. Data Analysis
- Text analysis
- Document summarization
- Information extraction
- Sentiment analysis

### 3. Content Creation
- Write blog posts, articles
- Translation
- Write professional emails
- Brainstorm ideas

### 4. Education
- Explain complex concepts
- Create exercises
- Learning guidance
- Personal tutoring

### 5. Business
- Customer support chatbot
- Process automation
- Report analysis
- Document generation

## Best Practices

### 1. Prompt Engineering
- **Clear and specific**: Describe exactly what you want
- **Provide context**: More information is better
- **Use examples**: Give examples of desired output
- **System prompts**: Use to guide Claude's behavior

```python
message = client.messages.create(
    model="claude-opus-4-20250514",
    max_tokens=1024,
    system="You are a Python programming expert with 10 years of experience.",
    messages=[
        {"role": "user", "content": "Explain list comprehension"}
    ]
)
```

### 2. Error Handling
```python
from anthropic import APIError, RateLimitError

try:
    message = client.messages.create(...)
except RateLimitError:
    print("Rate limit exceeded")
except APIError as e:
    print(f"API error: {e}")
```

### 3. Cost Optimization
- Use appropriate model for the task (Haiku for simple, Opus for complex)
- Set reasonable `max_tokens` limit
- Cache system prompts for repeated requests
- Use Prompt Caching

### 4. Security
- **DO NOT** hard-code API keys in code
- Use environment variables
- Rotate API keys regularly
- Limit permissions

```python
import os
from anthropic import Anthropic

client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)
```

## Pricing

Charged per token:
- **Input tokens**: Text you send to Claude
- **Output tokens**: Text Claude returns

See detailed pricing at: [anthropic.com/pricing](https://www.anthropic.com/pricing)

## Limits

### Rate Limits
- Depends on your plan (Free, Pro, Team, Enterprise)
- Measured in: Requests per minute (RPM) and Tokens per minute (TPM)

### Context Window
- Maximum 200,000 tokens for input
- Includes conversation history

### Output
- Max output tokens configurable
- Typically from 1024 to 8192 tokens

## Learning Resources

- **Documentation**: [docs.anthropic.com](https://docs.anthropic.com)
- **API Reference**: [docs.anthropic.com/claude/reference](https://docs.anthropic.com/claude/reference)
- **Cookbook**: [github.com/anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook)
- **Discord Community**: Join Anthropic community
- **Support**: support@anthropic.com

## Example Integration with MovieTheater

### Customer Support Chatbot

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
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # Call Claude API
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system="""You are an AI assistant for the MovieTheater cinema system.
            Your tasks are:
            - Help customers find suitable movies
            - Answer questions about showtimes
            - Assist with ticket booking
            - Provide information about the theater
            Be friendly, professional, and helpful.""",
            messages=self.conversation_history
        )

        # Get response and add to history
        assistant_message = response.content[0].text
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })

        return assistant_message

# Usage
assistant = MovieTheaterAssistant()
response = assistant.chat("What movies are currently showing?")
print(response)
```

### Movie Review Analysis

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
                "content": f"""Analyze the following movie reviews and summarize:
                - Overall sentiment (positive/negative/neutral)
                - Commonly mentioned highlights
                - Commonly complained weaknesses
                - Average rating (1-5 stars)

                Reviews:
                {reviews_text}
                """
            }
        ]
    )

    return message.content[0].text

# Example
reviews = [
    "Great movie, good acting but a bit long",
    "Excellent! Worth watching, beautiful effects",
    "Not very good, bland storyline"
]

analysis = analyze_movie_reviews(reviews)
print(analysis)
```

### Smart Recommendation System

```python
def get_movie_recommendations(user_preferences, available_movies):
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1500,
        system="You are a movie recommendation expert who understands user preferences and can suggest the best movies.",
        messages=[
            {
                "role": "user",
                "content": f"""Based on these user preferences:
                {user_preferences}

                And these available movies:
                {available_movies}

                Recommend the top 3 movies and explain why each one matches the user's preferences.
                """
            }
        ]
    )

    return message.content[0].text

# Example
user_prefs = "I love action movies with strong female leads, sci-fi elements, and good plot twists"
movies = """
1. The Matrix - Action, Sci-fi, Strong female lead
2. Mad Max: Fury Road - Action, Strong female lead
3. Inception - Action, Sci-fi, Plot twists
4. Wonder Woman - Action, Female lead, Fantasy
5. Arrival - Sci-fi, Female lead, Mind-bending
"""

recommendations = get_movie_recommendations(user_prefs, movies)
print(recommendations)
```

### Automated Content Generation

```python
def generate_movie_description(movie_info):
    """Generate engaging movie descriptions for website"""
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[
            {
                "role": "user",
                "content": f"""Create an engaging, concise movie description (2-3 sentences) for our website based on this information:

                {movie_info}

                Make it exciting and enticing for potential viewers.
                """
            }
        ]
    )

    return message.content[0].text

# Example
movie_info = {
    "title": "Space Odyssey 2099",
    "genre": "Sci-fi, Adventure",
    "director": "John Smith",
    "plot": "A team of astronauts discovers an ancient alien artifact on Mars"
}

description = generate_movie_description(str(movie_info))
print(description)
```

## Advanced Features

### Conversation Memory

```python
class ConversationalAgent:
    def __init__(self, system_prompt):
        self.client = anthropic.Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )
        self.system_prompt = system_prompt
        self.messages = []

    def send_message(self, user_input):
        self.messages.append({
            "role": "user",
            "content": user_input
        })

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=self.system_prompt,
            messages=self.messages
        )

        assistant_message = response.content[0].text
        self.messages.append({
            "role": "assistant",
            "content": assistant_message
        })

        return assistant_message

    def reset_conversation(self):
        self.messages = []

# Usage
agent = ConversationalAgent("You are a helpful movie theater assistant")
response1 = agent.send_message("What's playing tonight?")
response2 = agent.send_message("What about tomorrow?")  # Claude remembers context
```

### Batch Processing

```python
def process_reviews_batch(reviews_list):
    """Process multiple reviews efficiently"""
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    results = []
    for review in reviews_list:
        message = client.messages.create(
            model="claude-haiku-4-20250115",  # Use Haiku for speed
            max_tokens=100,
            messages=[
                {
                    "role": "user",
                    "content": f"Classify this review as POSITIVE, NEGATIVE, or NEUTRAL: {review}"
                }
            ]
        )
        results.append({
            "review": review,
            "sentiment": message.content[0].text.strip()
        })

    return results
```

## Troubleshooting

### Common Issues

**API Key Issues**
```python
# Check if API key is set
import os
if not os.environ.get("ANTHROPIC_API_KEY"):
    print("Warning: ANTHROPIC_API_KEY not set!")
```

**Rate Limiting**
```python
import time
from anthropic import RateLimitError

def call_with_retry(client, **kwargs):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            return client.messages.create(**kwargs)
        except RateLimitError:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                raise
```

**Context Length Issues**
```python
def truncate_conversation(messages, max_tokens=180000):
    """Keep conversation within context limits"""
    # Rough estimate: 1 token ≈ 4 characters
    while len(str(messages)) * 0.25 > max_tokens:
        # Remove oldest message pairs
        if len(messages) > 2:
            messages = messages[2:]
        else:
            break
    return messages
```

## Testing Your Integration

```python
def test_claude_integration():
    """Simple test to verify Claude integration works"""
    try:
        client = anthropic.Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )

        message = client.messages.create(
            model="claude-haiku-4-20250115",
            max_tokens=100,
            messages=[
                {"role": "user", "content": "Say 'integration successful'"}
            ]
        )

        print("✓ Claude integration test passed!")
        print(f"Response: {message.content[0].text}")
        return True

    except Exception as e:
        print(f"✗ Claude integration test failed: {e}")
        return False

# Run test
if __name__ == "__main__":
    test_claude_integration()
```

## Next Steps

1. Sign up at claude.ai or console.anthropic.com
2. Get your API key
3. Install the SDK
4. Try the examples in this guide
5. Integrate into your application

## Conclusion

Claude 4.6 (Opus 4.5 / Sonnet 4.5) is a powerful AI tool that can be integrated into many types of applications. With this guide, you can start using Claude for your projects.

Happy coding! 🚀

---

For more examples and detailed documentation, visit:
- [Anthropic Documentation](https://docs.anthropic.com)
- [API Reference](https://docs.anthropic.com/claude/reference)
- [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook)
