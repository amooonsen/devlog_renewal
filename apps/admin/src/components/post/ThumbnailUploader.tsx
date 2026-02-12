import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@repo/ui";
import { toast } from "sonner";
import { uploadThumbnail } from "@/lib/api";

interface ThumbnailUploaderProps {
  value?: string;
  onChange: (url: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ThumbnailUploader({ value, onChange }: ThumbnailUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("JPG, PNG, WebP 이미지만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      toast.error("파일 크기는 5MB 이하로 제한됩니다.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadThumbnail(file);
      onChange(url);
      toast.success("썸네일이 업로드되었습니다.");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("썸네일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      // input 초기화
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Thumbnail"
            className="h-32 w-48 rounded-md border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "업로드 중..." : "썸네일 업로드"}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
