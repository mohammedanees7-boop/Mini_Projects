# utils/decorators.py — Reusable decorators used across the project

import functools
import time
import logging

# Configure logging so all decorator logs appear in the console
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(levelname)s]  %(message)s",
    datefmt="%H:%M:%S",
)


def log_call(func):
    """Decorator: logs every function entry and exit with its name."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logging.info(f"→ Calling  : {func.__name__}")
        result = func(*args, **kwargs)
        logging.info(f"✓ Completed: {func.__name__}")
        return result
    return wrapper


def retry(times=3, delay=1):
    """
    Decorator factory: retries the wrapped function up to `times` attempts.
    Waits `delay` seconds between attempts.
    Raises the last exception if all attempts fail.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as exc:
                    logging.warning(
                        f"  Attempt {attempt}/{times} failed for "
                        f"'{func.__name__}': {exc}"
                    )
                    if attempt == times:
                        logging.error(
                            f"  All {times} attempts exhausted for '{func.__name__}'."
                        )
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator
