from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise

from herbimage_public.core.config import settings

TORTOISE_ORM = {
    "connections": {"default": str(settings.DATABASE_URI)},
    "apps": {
        "models": {
            "models": ["herbimage_public.users.models", "aerich.models"],
            "default_connection": "default",
        },
    },
}


def register_db(app: FastAPI) -> None:
    register_tortoise(
        app,
        config=TORTOISE_ORM,
        generate_schemas=False,
        add_exception_handlers=True,
    )
