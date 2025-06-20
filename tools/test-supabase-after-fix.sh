#!/bin/bash

echo "🔧 Testing Supabase upload after fixing service_role key..."

# Test upload
curl -X POST \
  'http://localhost:8080/movies/with-images' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'movieData={"title":"Test Movie","description":"Test upload with new key","duration":120,"genre":"Action","releaseDate":"2024-12-25","price":100000}' \
  -F 'poster=@test-poster.jpg' \
  -F 'backdrop=@test-backdrop.jpg'

echo ""
echo "✅ If upload succeeds, the service_role key is working!"
echo "❌ If still getting 403, check bucket policies in Supabase Dashboard" 