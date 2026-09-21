"""Shared helpers."""


def _camel(key: str) -> str:
    head, *rest = key.split("_")
    return head + "".join(part.title() for part in rest)


def camelise(value):
    """
    Recursively convert dict keys from snake_case to camelCase.

    Pydantic response models do this automatically, but the dashboard and
    analytics endpoints return assembled dictionaries rather than models.
    Without this the React side reads `crowd_index` as `undefined`, so
    every generated dict response goes through here on the way out.
    """
    if isinstance(value, dict):
        return {_camel(k): camelise(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [camelise(item) for item in value]
    return value
