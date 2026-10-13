import numpy as np

def classify_variable_type(data: list) -> dict:
    """
    Identifica automáticamente el tipo de variable estadística
    a partir del contenido de una muestra de datos.
    """
    if not data:
        raise ValueError("La lista de datos no puede estar vacía.")
    
    first_elem = data[0]
    
    if isinstance(first_elem, (int, float)):
        # Verificar si todos los elementos son enteros
        is_discrete = all(isinstance(x, int) or (isinstance(x, float) and x.is_integer()) for x in data)
        var_type = "CUANTITATIVA_DISCRETA" if is_discrete else "CUANTITATIVA_CONTINUA"
    elif isinstance(first_elem, str):
        var_type = "CUALITATIVA_NOMINAL"
    else:
        var_type = "NO_DEFINIDA"
        
    return {
        "sample_size": len(data),
        "inferred_type": var_type,
        "unique_values_count": len(set(data))
    }

def calculate_discrete_frequency(data: list) -> dict:
    """
    Calcula la tabla de frecuencias para variables cualitativas o cuantitativas discretas.
    """
    if not data:
        raise ValueError("No hay datos para procesar.")
        
    total = len(data)
    frequencies = {}
    
    for val in data:
        frequencies[str(val)] = frequencies.get(str(val), 0) + 1
        
    relative_frequencies = {k: round(v / total, 4) for k, v in frequencies.items()}
    
    return {
        "total_observations": total,
        "absolute_frequency": frequencies,
        "relative_frequency": relative_frequencies
    }