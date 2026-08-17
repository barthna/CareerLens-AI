import os
import shutil
import uuid
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class FileStorage:
    _local_storage_path = os.path.join(os.getcwd(), "storage")

    @classmethod
    def initialize(cls):
        """Ensure local storage folder exists if not using S3."""
        if not settings.STORAGE_BUCKET:
            os.makedirs(cls._local_storage_path, exist_ok=True)
            logger.info(f"Local storage initialized at: {cls._local_storage_path}")

    @classmethod
    def save_file(cls, file_content: bytes, filename: str) -> str:
        """Saves a file to disk or S3 and returns a reference path/URL."""
        # Clean file name & generate unique key
        ext = os.path.splitext(filename)[1]
        unique_name = f"{uuid.uuid4()}{ext}"
        
        if settings.STORAGE_BUCKET:
            # S3 implementation using boto3
            try:
                import boto3
                s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.STORAGE_ACCESS_KEY,
                    aws_secret_access_key=settings.STORAGE_SECRET_KEY,
                    region_name=settings.STORAGE_REGION
                )
                s3_client.put_object(
                    Bucket=settings.STORAGE_BUCKET,
                    Key=unique_name,
                    Body=file_content
                )
                logger.info(f"File uploaded to S3: {unique_name}")
                return f"s3://{settings.STORAGE_BUCKET}/{unique_name}"
            except Exception as e:
                logger.error(f"S3 upload failed: {str(e)}. Falling back to local storage.")
        
        # Local Storage Fallback
        cls.initialize()
        file_path = os.path.join(cls._local_storage_path, unique_name)
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        logger.info(f"File saved locally: {file_path}")
        return file_path

    @classmethod
    def delete_file(cls, file_path: str) -> bool:
        """Deletes a file from storage."""
        if file_path.startswith("s3://"):
            if not settings.STORAGE_BUCKET:
                return False
            try:
                import boto3
                key = file_path.replace(f"s3://{settings.STORAGE_BUCKET}/", "")
                s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.STORAGE_ACCESS_KEY,
                    aws_secret_access_key=settings.STORAGE_SECRET_KEY,
                    region_name=settings.STORAGE_REGION
                )
                s3_client.delete_object(Bucket=settings.STORAGE_BUCKET, Key=key)
                return True
            except Exception as e:
                logger.error(f"S3 delete failed: {str(e)}")
                return False
        else:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    return True
                except Exception as e:
                    logger.error(f"Local file delete failed: {str(e)}")
                    return False
            return False

    @classmethod
    def get_file(cls, file_path: str) -> bytes:
        """Retrieves raw file bytes."""
        if file_path.startswith("s3://"):
            try:
                import boto3
                key = file_path.replace(f"s3://{settings.STORAGE_BUCKET}/", "")
                s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.STORAGE_ACCESS_KEY,
                    aws_secret_access_key=settings.STORAGE_SECRET_KEY,
                    region_name=settings.STORAGE_REGION
                )
                response = s3_client.get_object(Bucket=settings.STORAGE_BUCKET, Key=key)
                return response["Body"].read()
            except Exception as e:
                logger.error(f"S3 get file failed: {str(e)}")
                raise FileNotFoundError(f"File not found in S3: {file_path}")
        else:
            if os.path.exists(file_path):
                with open(file_path, "rb") as f:
                    return f.read()
            raise FileNotFoundError(f"Local file not found: {file_path}")
# Initialize upon import
FileStorage.initialize()
