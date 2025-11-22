# backend/middleware.py
from django.conf import settings

class RealIPMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not settings.DEBUG:
            # محیط سرور - آی‌پی از X-Forwarded-For
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                request.real_ip = x_forwarded_for.split(',')[0]
            else:
                request.real_ip = request.META.get('REMOTE_ADDR')
        else:
            # محیط لوکال
            request.real_ip = request.META.get('REMOTE_ADDR')
        return self.get_response(request)
