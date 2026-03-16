// MovieTheater Claude Integration Examples
// This module demonstrates how to integrate Claude AI into a movie theater application using Node.js

import Anthropic from '@anthropic-ai/sdk';

/**
 * AI-powered assistant for MovieTheater application using Claude
 */
class MovieTheaterAssistant {
  constructor(apiKey = process.env.ANTHROPIC_API_KEY) {
    this.client = new Anthropic({ apiKey });
    this.conversationHistory = [];
    this.systemPrompt = `You are an AI assistant for MovieTheater, a cinema system.
Your responsibilities include:
- Helping customers find movies that match their preferences
- Answering questions about showtimes, pricing, and theater locations
- Assisting with ticket booking inquiries
- Providing movie recommendations based on user preferences
- Handling customer complaints professionally

Be friendly, professional, and helpful. Always prioritize customer satisfaction.`;
  }

  async chat(userMessage, model = 'claude-sonnet-4-20250514') {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    const response = await this.client.messages.create({
      model,
      max_tokens: 1024,
      system: this.systemPrompt,
      messages: this.conversationHistory
    });

    const assistantMessage = response.content[0].text;
    this.conversationHistory.push({
      role: 'assistant',
      content: assistantMessage
    });

    return assistantMessage;
  }

  resetConversation() {
    this.conversationHistory = [];
  }
}

/**
 * Analyze movie reviews using Claude
 */
class MovieReviewAnalyzer {
  constructor(apiKey = process.env.ANTHROPIC_API_KEY) {
    this.client = new Anthropic({ apiKey });
  }

  async analyzeReviews(reviews, model = 'claude-sonnet-4-20250514') {
    const reviewsText = reviews
      .map((review, i) => `Review ${i + 1}: ${review}`)
      .join('\n\n');

    const message = await this.client.messages.create({
      model,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Analyze these movie reviews and provide a JSON-formatted summary with:
1. overall_sentiment: "positive", "negative", or "neutral"
2. average_rating: estimated rating from 1-5 stars
3. highlights: list of positive aspects mentioned
4. criticisms: list of negative aspects mentioned
5. summary: brief overall summary (2-3 sentences)

Reviews:
${reviewsText}

Provide ONLY the JSON response, no additional text.`
        }
      ]
    });

    return message.content[0].text;
  }

  async classifySentiment(review, model = 'claude-haiku-4-20250115') {
    const message = await this.client.messages.create({
      model,
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: `Classify this review as POSITIVE, NEGATIVE, or NEUTRAL. Respond with only one word: ${review}`
        }
      ]
    });

    return message.content[0].text.trim().toUpperCase();
  }
}

/**
 * Generate personalized movie recommendations
 */
class MovieRecommendationEngine {
  constructor(apiKey = process.env.ANTHROPIC_API_KEY) {
    this.client = new Anthropic({ apiKey });
  }

  async getRecommendations(
    userPreferences,
    availableMovies,
    numRecommendations = 3,
    model = 'claude-sonnet-4-20250514'
  ) {
    const moviesText = availableMovies
      .map(
        (movie, i) =>
          `${i + 1}. ${movie.title || 'Unknown'} - ` +
          `Genre: ${movie.genre || 'N/A'}, ` +
          `Rating: ${movie.rating || 'N/A'}, ` +
          `Description: ${movie.description || 'N/A'}`
      )
      .join('\n');

    const message = await this.client.messages.create({
      model,
      max_tokens: 1500,
      system:
        'You are an expert movie recommendation system. Provide thoughtful, personalized recommendations.',
      messages: [
        {
          role: 'user',
          content: `Based on these user preferences:
${userPreferences}

And these available movies:
${moviesText}

Recommend the top ${numRecommendations} movies and explain why each one matches the user's preferences.
Format your response as a numbered list with clear explanations.`
        }
      ]
    });

    return message.content[0].text;
  }
}

/**
 * Generate marketing content and descriptions
 */
class ContentGenerator {
  constructor(apiKey = process.env.ANTHROPIC_API_KEY) {
    this.client = new Anthropic({ apiKey });
  }

  async generateMovieDescription(
    movieInfo,
    style = 'engaging',
    model = 'claude-sonnet-4-20250514'
  ) {
    const message = await this.client.messages.create({
      model,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Create an ${style} movie description (2-3 sentences) for our website based on:

Title: ${movieInfo.title || 'Unknown'}
Genre: ${movieInfo.genre || 'Unknown'}
Director: ${movieInfo.director || 'Unknown'}
Plot: ${movieInfo.plot || 'Unknown'}
Cast: ${movieInfo.cast || 'Unknown'}

Make it exciting and enticing for potential viewers.`
        }
      ]
    });

    return message.content[0].text;
  }

  async generateSocialMediaPost(
    movieTitle,
    showtimeInfo,
    platform = 'general',
    model = 'claude-sonnet-4-20250514'
  ) {
    const platformGuidelines = {
      twitter: 'Keep it under 280 characters, use 2-3 relevant hashtags',
      facebook: 'Make it engaging with 2-3 paragraphs, encourage comments',
      instagram: 'Visual-focused caption, use 5-10 hashtags, include emoji',
      general: 'Make it shareable and engaging'
    };

    const guideline = platformGuidelines[platform] || platformGuidelines.general;

    const message = await this.client.messages.create({
      model,
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Create a ${platform} post promoting the movie "${movieTitle}".
Showtime info: ${showtimeInfo}

Guidelines: ${guideline}

Be creative and promotional!`
        }
      ]
    });

    return message.content[0].text;
  }
}

/**
 * Streaming response example
 */
async function streamingExample(apiKey = process.env.ANTHROPIC_API_KEY) {
  const client = new Anthropic({ apiKey });

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: 'Write a short promotional text for a movie theater'
      }
    ]
  });

  process.stdout.write('Streaming response: ');
  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      process.stdout.write(chunk.delta.text);
    }
  }
  console.log('\n');
}

/**
 * Error handling example
 */
async function robustApiCall(client, messageParams, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.messages.create(messageParams);
    } catch (error) {
      if (error.status === 429 && attempt < maxRetries - 1) {
        // Rate limit - exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Example usage
async function main() {
  try {
    // Example 1: Customer support chatbot
    console.log('=== Example 1: Customer Support Chatbot ===');
    const assistant = new MovieTheaterAssistant();
    const response = await assistant.chat('What movies are showing this weekend?');
    console.log(`Assistant: ${response}\n`);

    // Example 2: Review analysis
    console.log('=== Example 2: Review Analysis ===');
    const analyzer = new MovieReviewAnalyzer();
    const reviews = [
      'Amazing movie! The special effects were stunning and the story kept me engaged throughout.',
      'Not bad, but I expected more from the director. Acting was good though.',
      'Disappointed. The plot was predictable and the pacing was off.'
    ];
    const analysis = await analyzer.analyzeReviews(reviews);
    console.log(`Analysis: ${analysis}\n`);

    // Example 3: Movie recommendations
    console.log('=== Example 3: Movie Recommendations ===');
    const recommender = new MovieRecommendationEngine();
    const movies = [
      {
        title: 'Space Odyssey',
        genre: 'Sci-Fi',
        rating: '8.5/10',
        description: 'Epic space adventure'
      },
      {
        title: 'Love in Paris',
        genre: 'Romance',
        rating: '7.8/10',
        description: 'Romantic comedy'
      },
      {
        title: 'Dark Knight',
        genre: 'Action',
        rating: '9.0/10',
        description: 'Superhero thriller'
      }
    ];
    const recommendations = await recommender.getRecommendations(
      'I love action movies with great cinematography and deep storylines',
      movies
    );
    console.log(`Recommendations: ${recommendations}\n`);

    // Example 4: Content generation
    console.log('=== Example 4: Content Generation ===');
    const generator = new ContentGenerator();
    const movieInfo = {
      title: 'The Last Journey',
      genre: 'Adventure/Drama',
      director: 'Jane Smith',
      plot: 'A retired explorer embarks on one final adventure to find a lost city',
      cast: 'Tom Hardy, Emma Stone'
    };
    const description = await generator.generateMovieDescription(movieInfo);
    console.log(`Generated Description: ${description}\n`);

    // Example 5: Streaming
    console.log('=== Example 5: Streaming Response ===');
    await streamingExample();

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Export classes
export {
  MovieTheaterAssistant,
  MovieReviewAnalyzer,
  MovieRecommendationEngine,
  ContentGenerator,
  streamingExample,
  robustApiCall
};

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
