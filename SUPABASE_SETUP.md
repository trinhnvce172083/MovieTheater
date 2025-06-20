# Hướng dẫn Setup Supabase cho Movie Theater System

## 1. Tạo Project Supabase

1. Truy cập [supabase.com](https://supabase.com)
2. Đăng ký/Đăng nhập tài khoản
3. Tạo project mới
4. Ghi lại thông tin:
   - Project URL: `https://your-project.supabase.co`
   - API Key (service_role): Trong Settings > API

## 2. Tạo Storage Bucket

```sql
-- Vào SQL Editor trong Supabase Dashboard và chạy:
INSERT INTO storage.buckets (id, name, public)
VALUES ('movie-theater-images', 'movie-theater-images', true);
```

## 3. Thiết lập Storage Policies

```sql
-- Policy cho phép read public
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'movie-theater-images');

-- Policy cho phép upload authenticated users
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'movie-theater-images' AND auth.role() = 'authenticated');

-- Policy cho phép delete authenticated users
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'movie-theater-images' AND auth.role() = 'authenticated');

-- Policy cho phép update authenticated users  
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'movie-theater-images' AND auth.role() = 'authenticated');
```

## 4. Cấu hình Environment Variables

Thêm vào file `application.yml` hoặc `.env`:

```yaml
supabase:
  url: https://your-project.supabase.co
  key: your-service-role-key
  bucket: movie-theater-images
```

Hoặc sử dụng environment variables:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_BUCKET=movie-theater-images
```

## 5. API Endpoints được tạo

### File Upload API
- `POST /api/files/upload/{folder}` - Upload file vào thư mục cụ thể
- `DELETE /api/files/delete?url={url}` - Xóa file theo URL
- `POST /api/files/replace/{folder}` - Thay thế file cũ bằng file mới

### Movie Image API
- `POST /api/images/movies/{movieId}/poster` - Cập nhật poster phim
- `POST /api/images/movies/{movieId}/backdrop` - Cập nhật backdrop phim
- `DELETE /api/images/movies/{movieId}/poster` - Xóa poster phim
- `DELETE /api/images/movies/{movieId}/backdrop` - Xóa backdrop phim

### Account Avatar API
- `POST /api/images/accounts/{accountId}/avatar` - Cập nhật avatar tài khoản
- `DELETE /api/images/accounts/{accountId}/avatar` - Xóa avatar tài khoản

## 6. Cách sử dụng từ Frontend

### Upload ảnh cho movie poster:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/images/movies/1/poster', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Poster URL:', data.url);
  }
});
```

### Upload avatar cho user:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/images/accounts/123/avatar', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Avatar URL:', data.url);
  }
});
```

## 7. Validation Rules

- Chỉ chấp nhận file ảnh: jpg, jpeg, png, gif, webp
- Kích thước tối đa: 5MB
- Content-Type phải là image/*

## 8. Folder Structure trong Supabase

```
movie-theater-images/
├── movies/
│   ├── posters/
│   └── backdrops/
├── accounts/
│   └── avatars/
└── general/
```

## 9. Security Features

- File validation (type, size)
- Authentication required cho upload/delete
- Role-based access control
- Automatic cleanup khi thay thế file cũ

## 10. Troubleshooting

### Lỗi "Upload file thất bại":
- Kiểm tra SUPABASE_KEY có đúng không
- Kiểm tra bucket policies
- Kiểm tra network connection

### Lỗi "Không thể xóa file":
- Kiểm tra file có tồn tại không
- Kiểm tra permissions
- Kiểm tra URL format

### Lỗi validation:
- Kiểm tra file type
- Kiểm tra file size (max 5MB)
- Kiểm tra file không corrupted 

### Lỗi 403 "row-level security policy"

Nếu gặp lỗi:
```
{"statusCode":"403","error":"Unauthorized","message":"new row violates row-level security policy"}
```

**Nguyên nhân:** RLS policies chưa được cấu hình đúng.

**Giải pháp:**

1. **Truy cập Supabase Dashboard** → **Storage** → **Policies**

2. **Tạo policy cho INSERT (Upload):**
```sql
-- Policy name: Enable insert for service_role
-- Target roles: service_role

CREATE POLICY "Enable insert for service_role" 
ON storage.objects 
FOR INSERT 
TO service_role 
WITH CHECK (true);
```

3. **Tạo policy cho SELECT (Download):**
```sql
-- Policy name: Enable select for all users
-- Target roles: public

CREATE POLICY "Enable select for all users" 
ON storage.objects 
FOR SELECT 
TO public 
USING (true);
```

4. **Tạo policy cho DELETE:**
```sql
-- Policy name: Enable delete for service_role
-- Target roles: service_role

CREATE POLICY "Enable delete for service_role" 
ON storage.objects 
FOR DELETE 
TO service_role 
USING (true);
```

5. **Hoặc disable RLS hoàn toàn (không khuyến khích):**
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

### ⚠️ Kiểm tra Service Key (Quan trọng!)

**NGUYÊN NHÂN CHÍNH**: Bạn đang dùng **anon key** thay vì **service_role key**.

**Current key trong application.yml:**
```yaml
# ❌ Đây là ANON KEY (role: "anon") - KHÔNG có quyền upload
key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1endqanNlZW9obnlyYmZjbmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NTk5MDgsImV4cCI6MjA2NTAzNTkwOH0.vaSV9NrHay2hIf8chxqaxgRMFfY6STgZJlFqOSyTKD0
```

**Cần thay thế bằng SERVICE_ROLE KEY:**

1. **Truy cập Supabase Dashboard** → **Settings** → **API**

2. **Copy "service_role" key** (không phải "anon" key)

3. **Thay thế key trong application.yml:**
```yaml
supabase:
  url: https://cuzwjjseeohnyrbfcngs.supabase.co
  key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1endqanNlZW9obnlyYmZjbmdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ1OTkwOCwiZXhwIjoyMDY1MDM1OTA4fQ.XXXXXXXXXXX  # SERVICE_ROLE KEY
  bucket: image
```

**Cách phân biệt:**
- Decode JWT token tại https://jwt.io
- ✅ Service Role: `"role": "service_role"`
- ❌ Anon Key: `"role": "anon"` 