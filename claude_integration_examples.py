"""
MovieTheater Claude Integration Examples
This module demonstrates how to integrate Claude AI into a movie theater application.
"""

import anthropic
import os
from typing import List, Dict, Optional


class MovieTheaterAssistant:
    """
    AI-powered assistant for MovieTheater application using Claude.
    Handles customer inquiries, recommendations, and support.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the MovieTheater assistant.

        Args:
            api_key: Anthropic API key. If not provided, reads from ANTHROPIC_API_KEY env var.
        """
        self.client = anthropic.Anthropic(
            api_key=api_key or os.environ.get("ANTHROPIC_API_KEY")
        )
        self.conversation_history = []
        self.system_prompt = """You are an AI assistant for MovieTheater, a cinema system.
        Your responsibilities include:
        - Helping customers find movies that match their preferences
        - Answering questions about showtimes, pricing, and theater locations
        - Assisting with ticket booking inquiries
        - Providing movie recommendations based on user preferences
        - Handling customer complaints professionally

        Be friendly, professional, and helpful. Always prioritize customer satisfaction.
        If you don't know specific information (like exact showtimes), acknowledge this and
        suggest how the customer can find the information."""

    def chat(self, user_message: str, model: str = "claude-sonnet-4-20250514") -> str:
        """
        Send a message to Claude and get a response.

        Args:
            user_message: The user's message
            model: Claude model to use (default: claude-sonnet-4-20250514)

        Returns:
            Claude's response as a string
        """
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        response = self.client.messages.create(
            model=model,
            max_tokens=1024,
            system=self.system_prompt,
            messages=self.conversation_history
        )

        assistant_message = response.content[0].text
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })

        return assistant_message

    def reset_conversation(self):
        """Clear the conversation history."""
        self.conversation_history = []


class MovieReviewAnalyzer:
    """
    Analyze movie reviews using Claude to extract insights and sentiment.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.client = anthropic.Anthropic(
            api_key=api_key or os.environ.get("ANTHROPIC_API_KEY")
        )

    def analyze_reviews(self, reviews: List[str], model: str = "claude-sonnet-4-20250514") -> Dict:
        """
        Analyze multiple movie reviews and provide comprehensive insights.

        Args:
            reviews: List of review texts
            model: Claude model to use

        Returns:
            Dictionary containing analysis results
        """
        reviews_text = "\n\n".join([f"Review {i+1}: {review}" for i, review in enumerate(reviews)])

        message = self.client.messages.create(
            model=model,
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": f"""Analyze these movie reviews and provide a JSON-formatted summary with:
                    1. overall_sentiment: "positive", "negative", or "neutral"
                    2. average_rating: estimated rating from 1-5 stars
                    3. highlights: list of positive aspects mentioned
                    4. criticisms: list of negative aspects mentioned
                    5. summary: brief overall summary (2-3 sentences)

                    Reviews:
                    {reviews_text}

                    Provide ONLY the JSON response, no additional text.
                    """
                }
            ]
        )

        return message.content[0].text

    def classify_sentiment(self, review: str, model: str = "claude-haiku-4-20250115") -> str:
        """
        Quickly classify the sentiment of a single review.

        Args:
            review: Review text
            model: Claude model to use (Haiku for speed)

        Returns:
            Sentiment classification: "POSITIVE", "NEGATIVE", or "NEUTRAL"
        """
        message = self.client.messages.create(
            model=model,
            max_tokens=50,
            messages=[
                {
                    "role": "user",
                    "content": f"Classify this review as POSITIVE, NEGATIVE, or NEUTRAL. Respond with only one word: {review}"
                }
            ]
        )

        return message.content[0].text.strip().upper()


class MovieRecommendationEngine:
    """
    Generate personalized movie recommendations using Claude.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.client = anthropic.Anthropic(
            api_key=api_key or os.environ.get("ANTHROPIC_API_KEY")
        )

    def get_recommendations(
        self,
        user_preferences: str,
        available_movies: List[Dict],
        num_recommendations: int = 3,
        model: str = "claude-sonnet-4-20250514"
    ) -> str:
        """
        Get personalized movie recommendations.

        Args:
            user_preferences: Description of user's movie preferences
            available_movies: List of available movies with their details
            num_recommendations: Number of movies to recommend
            model: Claude model to use

        Returns:
            Formatted recommendations with explanations
        """
        movies_text = "\n".join([
            f"{i+1}. {movie.get('title', 'Unknown')} - "
            f"Genre: {movie.get('genre', 'N/A')}, "
            f"Rating: {movie.get('rating', 'N/A')}, "
            f"Description: {movie.get('description', 'N/A')}"
            for i, movie in enumerate(available_movies)
        ])

        message = self.client.messages.create(
            model=model,
            max_tokens=1500,
            system="You are an expert movie recommendation system. Provide thoughtful, personalized recommendations.",
            messages=[
                {
                    "role": "user",
                    "content": f"""Based on these user preferences:
                    {user_preferences}

                    And these available movies:
                    {movies_text}

                    Recommend the top {num_recommendations} movies and explain why each one matches the user's preferences.
                    Format your response as a numbered list with clear explanations.
                    """
                }
            ]
        )

        return message.content[0].text


class ContentGenerator:
    """
    Generate marketing content and descriptions for movies using Claude.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.client = anthropic.Anthropic(
            api_key=api_key or os.environ.get("ANTHROPIC_API_KEY")
        )

    def generate_movie_description(
        self,
        movie_info: Dict,
        style: str = "engaging",
        model: str = "claude-sonnet-4-20250514"
    ) -> str:
        """
        Generate an engaging movie description for marketing.

        Args:
            movie_info: Dictionary containing movie details
            style: Writing style ("engaging", "formal", "casual")
            model: Claude model to use

        Returns:
            Generated description
        """
        message = self.client.messages.create(
            model=model,
            max_tokens=500,
            messages=[
                {
                    "role": "user",
                    "content": f"""Create an {style} movie description (2-3 sentences) for our website based on:

                    Title: {movie_info.get('title', 'Unknown')}
                    Genre: {movie_info.get('genre', 'Unknown')}
                    Director: {movie_info.get('director', 'Unknown')}
                    Plot: {movie_info.get('plot', 'Unknown')}
                    Cast: {movie_info.get('cast', 'Unknown')}

                    Make it exciting and enticing for potential viewers.
                    """
                }
            ]
        )

        return message.content[0].text

    def generate_social_media_post(
        self,
        movie_title: str,
        showtime_info: str,
        platform: str = "general",
        model: str = "claude-sonnet-4-20250514"
    ) -> str:
        """
        Generate social media posts for movie promotions.

        Args:
            movie_title: Name of the movie
            showtime_info: Information about showtimes
            platform: Social media platform ("twitter", "facebook", "instagram", "general")
            model: Claude model to use

        Returns:
            Generated social media post
        """
        platform_guidelines = {
            "twitter": "Keep it under 280 characters, use 2-3 relevant hashtags",
            "facebook": "Make it engaging with 2-3 paragraphs, encourage comments",
            "instagram": "Visual-focused caption, use 5-10 hashtags, include emoji",
            "general": "Make it shareable and engaging"
        }

        guideline = platform_guidelines.get(platform, platform_guidelines["general"])

        message = self.client.messages.create(
            model=model,
            max_tokens=300,
            messages=[
                {
                    "role": "user",
                    "content": f"""Create a {platform} post promoting the movie "{movie_title}".
                    Showtime info: {showtime_info}

                    Guidelines: {guideline}

                    Be creative and promotional!
                    """
                }
            ]
        )

        return message.content[0].text


# Example usage
if __name__ == "__main__":
    # Example 1: Customer support chatbot
    print("=== Example 1: Customer Support Chatbot ===")
    assistant = MovieTheaterAssistant()
    response = assistant.chat("What movies are showing this weekend?")
    print(f"Assistant: {response}\n")

    # Example 2: Review analysis
    print("=== Example 2: Review Analysis ===")
    analyzer = MovieReviewAnalyzer()
    reviews = [
        "Amazing movie! The special effects were stunning and the story kept me engaged throughout.",
        "Not bad, but I expected more from the director. Acting was good though.",
        "Disappointed. The plot was predictable and the pacing was off."
    ]
    analysis = analyzer.analyze_reviews(reviews)
    print(f"Analysis: {analysis}\n")

    # Example 3: Movie recommendations
    print("=== Example 3: Movie Recommendations ===")
    recommender = MovieRecommendationEngine()
    movies = [
        {"title": "Space Odyssey", "genre": "Sci-Fi", "rating": "8.5/10", "description": "Epic space adventure"},
        {"title": "Love in Paris", "genre": "Romance", "rating": "7.8/10", "description": "Romantic comedy"},
        {"title": "Dark Knight", "genre": "Action", "rating": "9.0/10", "description": "Superhero thriller"}
    ]
    recommendations = recommender.get_recommendations(
        "I love action movies with great cinematography and deep storylines",
        movies
    )
    print(f"Recommendations: {recommendations}\n")

    # Example 4: Content generation
    print("=== Example 4: Content Generation ===")
    generator = ContentGenerator()
    movie_info = {
        "title": "The Last Journey",
        "genre": "Adventure/Drama",
        "director": "Jane Smith",
        "plot": "A retired explorer embarks on one final adventure to find a lost city",
        "cast": "Tom Hardy, Emma Stone"
    }
    description = generator.generate_movie_description(movie_info)
    print(f"Generated Description: {description}\n")
