"""
ASGI config for notehub project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "notehub.settings")

application = get_asgi_application()
