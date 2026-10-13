def calculate_bayes(prior: float, likelihood: float, marginal: float) -> dict:
    if marginal <= 0 or marginal > 1:
        raise ValueError("La probabilidad marginal P(B) debe estar en el rango (0, 1].")
    if prior < 0 or prior > 1:
        raise ValueError("La probabilidad a priori P(A) debe estar en el rango [0, 1].")
    if likelihood < 0 or likelihood > 1:
        raise ValueError("La verosimilitud P(B|A) debe estar en el rango [0, 1].")

    posterior = (likelihood * prior) / marginal

    if posterior > 1.0:
        raise ValueError("El resultado de la probabilidad posterior excede 1.0.")

    return {
        "prior": prior,
        "likelihood": likelihood,
        "marginal": marginal,
        "posterior": round(posterior, 4),
        "posterior_percentage": f"{round(posterior * 100, 2)}%"
    }