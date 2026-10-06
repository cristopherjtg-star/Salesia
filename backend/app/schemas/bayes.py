from pydantic import BaseModel, Field

class BayesRequest(BaseModel):
    prior: float = Field(..., gt=0, le=1, description="Probabilidad a priori P(A)")
    likelihood: float = Field(..., gt=0, le=1, description="Verosimilitud P(B|A)")
    marginal: float = Field(..., gt=0, le=1, description="Probabilidad marginal P(B)")

class BayesResult(BaseModel):
    prior_P_A: float
    likelihood_P_B_given_A: float
    marginal_P_B: float
    posterior_P_A_given_B: float
    percentage: str