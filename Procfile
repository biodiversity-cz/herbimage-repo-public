web: gunicorn herbimage_public.main:app -k uvicorn.workers.UvicornWorker
worker: python manage.py run-worker