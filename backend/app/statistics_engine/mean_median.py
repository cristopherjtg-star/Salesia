import numpy as np

def calculate_central_tendency(values: list[float]) -> dict:
    if not values:
        raise ValueError("La lista de valores no puede estar vacía.")
    
    arr = np.array(values)
    mean_val = float(np.mean(arr))
    median_val = float(np.median(arr))
    std_val = float(np.std(arr, ddof=1)) # ddof=1 para desviación estándar muestral

    # Determinar el análisis de sesgo
    if mean_val > median_val:
        bias = "Sesgo Positivo (Asimétrica a la derecha). Existen ventas típicas elevadas."
    elif mean_val < median_val:
        bias = "Sesgo Negativo (Asimétrica a la izquierda)."
    else:
        bias = "Distribución Simétrica."

    return {
        "mean": mean_val,
        "median": median_val,
        "std_dev": std_val,  # <-- Agrega esta clave (o 'std' según cómo la lea tu frontend)
        "min": float(np.min(arr)),
        "max": float(np.max(arr)),
        "count": len(values),
        "bias_analysis": bias
    }