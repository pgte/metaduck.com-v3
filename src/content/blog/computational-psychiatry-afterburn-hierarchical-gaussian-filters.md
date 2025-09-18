---
title: "Diving Deeper: Perception, Beliefs, and the Hierarchical Gaussian Filter"
description: "A practical introduction to the Hierarchical Gaussian Filter (HGF) in computational psychiatry—how it models human perception, belief updating, and learning under uncertainty, with intuitive explanations for software engineers."
author: "Pedro Teixeira"
date: 2025-09-18
tags: ["Computational Psychiatry", "AI & ML"]
image: "/images/blog/astronaut-brain-computer.jpg"
---

![Astronaut and brain](/images/blog/astronaut-brain-computer.jpg)

> **Welcome back!** In our [previous article on computational psychiatry](/blog/computational-psychiatry-afterburn-the-code-behind-the-brain), we took a bird's-eye view of the field, exploring models of perception, action, and learning. Now, it's time to zoom in and get our hands dirty with the actual mathematics and code.

As promised, we're starting with **perception**, and our first stop is a fascinating Bayesian model called the **Hierarchical Gaussian Filter (HGF)**.

## 🧠 What is the HGF?

For us software engineers, you can think of the HGF as a **real-time belief updating system**. Imagine you're building a spam filter:

- You have a model of what "spam" looks like
- With each new email, you update your model based on prediction errors
- The more uncertain you are, the more you learn from new evidence

The HGF does something similar, but it's designed to model how _we_ as humans update our beliefs about the world, especially in environments that are constantly changing.

> 💡 **Key Insight**: The HGF isn't just about updating beliefs—it's about _how much_ to update them based on our own uncertainty. It's like having a dynamic learning rate that adjusts itself!

---

## 🎯 The Core Concept: Learning Under Uncertainty

At its core, the HGF is a model of **learning under uncertainty**. As we navigate the world, we're constantly making predictions. When those predictions are wrong, we experience a **prediction error (PE)**—the difference between what we expected and what we got.

The HGF proposes that we use these prediction errors to update our beliefs, but here's the clever part:

> **The size of the update depends on our uncertainty!**

- **High certainty** → Small updates (we're confident, so one wrong prediction won't change our minds)
- **High uncertainty** → Large updates (we're unsure, so we're more swayed by new evidence)

### 🏗️ The Hierarchical Structure

This is where the "hierarchical" part comes in. The HGF models beliefs at **multiple levels**:

| Level        | What it represents       | Example                                        |
| ------------ | ------------------------ | ---------------------------------------------- |
| **Level 1**  | Specific stimulus        | "Is this email spam?"                          |
| **Level 2**  | Environmental volatility | "How likely is the spammer to change tactics?" |
| **Level 3+** | Higher-order beliefs     | "How stable is the email system overall?"      |

Each level represents increasingly abstract and stable beliefs about the world.

### 🔄 Dynamic Learning Rates

This hierarchical structure allows the HGF to do something really neat: **it can adjust its own learning rate**!

- **Stable environment** → Low learning rate (don't overreact to noise)
- **Volatile environment** → High learning rate (adapt quickly to changes)

It's like having a smart algorithm that knows when to be conservative and when to be aggressive in updating its beliefs.

---

## 🧮 The Math Behind the Magic

Okay, let's pop the hood and look at the math. Don't worry, we'll keep it conceptual and focus on the key insights.

### 📊 Gaussian Beliefs

The HGF assumes that our beliefs about the world can be represented by **Gaussian probability distributions** (the familiar bell curve). Each belief is defined by two parameters:

- **Mean (μ)**: Our best guess about the true value
- **Variance (σ²)**: Our uncertainty about that guess

> **Think of it like this**: If you're 90% sure it will rain tomorrow, your belief has a high mean (close to 1) and low variance (you're confident). If you're unsure, your belief has a high variance (you're uncertain).

### 🏗️ Hierarchical Structure

The model consists of a series of levels, where the state at level $i$ is denoted by $x_i$:

- **$x_1$**: The quantity we're trying to predict (e.g., "will it rain?")
- **$x_2, x_3, ...$**: Higher levels representing volatility and stability

### 🔄 The Update Equations

The update equations for the HGF are derived using **variational Bayes** (a way of approximating complex probability distributions). Here are the key equations:

#### 1. **Prediction at level i:**

$$\hat{\mu}_i^{(k)} = \mu_i^{(k-1)}$$

#### 2. **Prediction error at level i:**

$$\delta_i^{(k)} = x_i^{(k)} - \hat{\mu}_i^{(k)}$$

#### 3. **Update of the mean at level i:**

$$\mu_i^{(k)} = \hat{\mu}_i^{(k)} + \alpha_i \cdot \delta_i^{(k)}$$

Where:

- $k$ = trial number
- $\hat{\mu}_i^{(k)}$ = prediction at level $i$ on trial $k$
- $\delta_i^{(k)}$ = prediction error
- $\alpha_i$ = **dynamic learning rate**

### 🎯 The Key Insight

> **$\alpha_i$ isn't a fixed learning rate you have to tune!** It's calculated on the fly, based on the model's own uncertainty at the next level up. That's what allows the HGF to dynamically adjust how much it learns.

This is what makes the HGF so powerful—it's **self-tuning** based on its own confidence levels.

---

## 🏥 Real-World Applications: From Schizophrenia to Addiction

So, what can we do with this fancy model? The HGF has been used to study a wide range of cognitive processes and psychiatric conditions. Here are some fascinating examples:

### 🧠 Schizophrenia Research

**What they're studying**: Perceptual disturbances like hallucinations and delusions

**The HGF insight**: These experiences might be caused by an inability to properly weigh prediction errors, leading to a distorted model of the world.

**Key papers**:

- [Mathys et al. (2011)](https://www.frontiersin.org/articles/10.3389/fnhum.2011.00039/full) - Foundational HGF paper
- [Adams et al. (2013)](https://www.nature.com/articles/nn.3276) - HGF in schizophrenia

### 😰 Anxiety Disorders

**What they're studying**: How we learn about threats in our environment

**The HGF insight**: Anxiety might be related to how we process uncertainty and prediction errors about potential dangers.

**Key papers**:

- [Browning et al. (2015)](https://www.nature.com/articles/nn.4102) - Anxiety and uncertainty
- [Paulus & Stein (2006)](https://www.nature.com/articles/nrn1611) - Decision-making in anxiety

### 🎯 Addiction Research

**What they're studying**: Decision-making processes involved in addiction

**The HGF insight**: Understanding why some people are more likely to relapse after abstinence periods.

**Key papers**:

- [Redish (2004)](https://www.nature.com/articles/nrn1470) - Addiction as a decision-making disorder
- [Glimcher (2011)](https://www.nature.com/articles/nn.2723) - Understanding addiction through computational models

### 🎯 The Power of Computational Psychiatry

The beauty of the HGF is that it provides a **formal, mathematical framework** for thinking about these complex issues. It allows us to:

- Move beyond simply describing symptoms
- Start understanding the underlying computational mechanisms
- Develop targeted treatments based on mathematical models
- Predict behavior and outcomes

> **💡 This is the future of psychiatry**: Using computational models to understand the brain like we understand software systems.

---

## 💻 Let's Get Our Hands Dirty: A Code Sample

Of course, no article for software engineers would be complete without some code! There are several implementations of the HGF, but one of the most popular is the [`pyhgf`](https://github.com/ComputationalPsychiatry/pyhgf) library for Python.

### 🚀 Quick Start Example

Here's how you might use `pyhgf` to simulate a simple learning experiment:

```python
from pyhgf.model import HGF
from pyhgf import load_data
import matplotlib.pyplot as plt
import numpy as np

# Load some example data (binary outcomes)
timeseries = load_data("binary")
print(f"Loaded {len(timeseries)} data points")

# Define our HGF model
hgf = HGF(
    n_levels=2,                    # Two levels: stimulus + volatility
    model_type="binary",           # Binary outcomes (0 or 1)
    initial_mu={"1": 0.0, "2": 0.5},  # Initial beliefs
    initial_pi={"1": 0.0, "2": 1e4},  # Initial precisions (inverse variance)
    omega={"2": -3.0},            # Volatility parameters
)

# Feed the data to the model
hgf.input_data(input_data=timeseries)

# Compute the model's surprise (-log probability)
surprise = hgf.surprise()
print(f"Model's surprise = {surprise:.2f}")

# Plot the belief trajectories
hgf.plot_trajectories()
plt.title("HGF Belief Trajectories")
plt.show()
```

### 🧪 A More Realistic Example: Simulating a Learning Task

Let's create a more comprehensive example that simulates a real learning experiment:

```python
import numpy as np
import matplotlib.pyplot as plt
from pyhgf.model import HGF
from pyhgf import load_data

# Simulate a learning task: predicting weather patterns
# We'll create data where the probability of rain changes over time
np.random.seed(42)  # For reproducibility

# Create a changing environment
n_trials = 100
true_probabilities = np.concatenate([
    np.full(25, 0.3),  # Dry period
    np.linspace(0.3, 0.7, 25),  # Transition period
    np.full(25, 0.7),  # Wet period
    np.linspace(0.7, 0.2, 25)   # Another transition
])

# Generate binary outcomes based on true probabilities
observations = np.random.binomial(1, true_probabilities)

print(f"Simulated {n_trials} trials with changing weather patterns")
print(f"True probabilities range: {true_probabilities.min():.2f} to {true_probabilities.max():.2f}")

# Set up the HGF model
hgf = HGF(
    n_levels=3,  # Three levels for more complex learning
    model_type="binary",
    initial_mu={"1": 0.0, "2": 0.0, "3": 0.0},
    initial_pi={"1": 0.0, "2": 1.0, "3": 1.0},
    omega={"2": -2.0, "3": -4.0},  # Volatility parameters
)

# Process the data
hgf.input_data(input_data=observations)

# Get the model's beliefs over time
beliefs = hgf.get_trajectories()
mu_1 = beliefs["mu"][0]  # Level 1 beliefs (probability of rain)
mu_2 = beliefs["mu"][1]  # Level 2 beliefs (volatility)
mu_3 = beliefs["mu"][2]  # Level 3 beliefs (meta-volatility)

# Plot the results
fig, axes = plt.subplots(3, 1, figsize=(12, 10))

# Plot 1: True vs Predicted Probabilities
axes[0].plot(true_probabilities, 'b-', label='True Probability', linewidth=2)
axes[0].plot(mu_1, 'r--', label='HGF Prediction', linewidth=2)
axes[0].set_ylabel('Probability of Rain')
axes[0].set_title('HGF Learning: True vs Predicted Probabilities')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Plot 2: Volatility (Level 2)
axes[1].plot(mu_2, 'g-', label='Environmental Volatility', linewidth=2)
axes[1].set_ylabel('Volatility (Level 2)')
axes[1].set_title('How the Model Perceives Environmental Change')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

# Plot 3: Meta-volatility (Level 3)
axes[2].plot(mu_3, 'm-', label='Meta-volatility (Level 3)', linewidth=2)
axes[2].set_ylabel('Meta-volatility (Level 3)')
axes[2].set_xlabel('Trial Number')
axes[2].set_title('Higher-Order Beliefs About Stability')
axes[2].legend()
axes[2].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# Print some statistics
print(f"\nModel Performance:")
print(f"Final surprise: {hgf.surprise():.2f}")
print(f"Final prediction: {mu_1[-1]:.3f}")
print(f"True final probability: {true_probabilities[-1]:.3f}")
print(f"Prediction error: {abs(mu_1[-1] - true_probabilities[-1]):.3f}")
```

### 🔍 What This Example Demonstrates

This more realistic example shows:

1. **Dynamic Learning**: The model adapts to changing environments
2. **Hierarchical Beliefs**: Three levels of uncertainty tracking
3. **Real-world Application**: Simulating a weather prediction task
4. **Visualization**: Clear plots showing how beliefs evolve

### 🎯 Key Insights from the Code

- **Level 1 (μ₁)**: Tracks the probability of rain
- **Level 2 (μ₂)**: Tracks how volatile the weather is
- **Level 3 (μ₃)**: Tracks higher-order stability beliefs

The model automatically adjusts its learning rate based on its own uncertainty, just like we discussed in the theory section!

### 🔍 What's Happening Here?

1. **Data Loading**: We load binary data (0s and 1s) representing some outcome
2. **Model Setup**: We create a 2-level HGF model for binary outcomes
3. **Learning**: The model processes the data and updates its beliefs
4. **Analysis**: We measure how "surprised" the model was by the data

### 🛠️ Try It Yourself!

To get started with `pyhgf`:

```bash
pip install pyhgf
```

Then check out these resources:

- [PyHGF Documentation](https://computationalpsychiatry.github.io/pyhgf/) - Complete API reference
- [Jupyter Notebooks](https://github.com/ComputationalPsychiatry/pyhgf/tree/main/notebooks) - Interactive tutorials

### 🎯 What Can You Build?

With `pyhgf`, you can:

- **Simulate learning experiments** - See how beliefs change over time
- **Analyze behavioral data** - Fit models to real human behavior
- **Compare different models** - Test which model best explains the data
- **Visualize belief trajectories** - Watch the model learn in real-time

> **💡 Pro Tip**: Start with the binary examples, then move to continuous data. The concepts are the same, but the math gets a bit more complex!

---

## 🎯 Wrapping Up

So there you have it: a whirlwind tour of the **Hierarchical Gaussian Filter**! We've covered:

✅ **The core concept** - Learning under uncertainty with dynamic learning rates  
✅ **The math** - Gaussian beliefs, hierarchical structure, and update equations  
✅ **Real applications** - From schizophrenia to addiction research  
✅ **Hands-on code** - Using `pyhgf` to simulate learning experiments

### 🚀 What's Next?

In our next article, we'll continue our journey into the world of **perception**, exploring other fascinating models like:

- **Predictive Coding** - How the brain makes predictions about sensory input
- **Active Inference** - The theory that the brain is constantly trying to minimize surprise
- **Bayesian Brain Hypothesis** - The idea that the brain is fundamentally Bayesian

## 📚 Want to Go Deeper? Resources for Further Study

If this sparked your curiosity and you're ready to dive headfirst into the HGF rabbit hole, here are some excellent resources to get you started. They range from foundational academic papers to hands-on coding toolboxes.

### 📖 Foundational Papers

#### 1. **A Bayesian foundation for individual learning under uncertainty (2011)**

**Authors**: Mathys, C., Daunizeau, J., Friston, K. J., & Stephan, K. E.  
**Link**: [Frontiers in Human Neuroscience](https://www.frontiersin.org/articles/10.3389/fnhum.2011.00039/full)

**Why read it?** This is the seminal paper that lays out the full mathematical theory of the HGF. It's dense, but it's the definitive source.

#### 2. **Uncertainty in perception and the Hierarchical Gaussian Filter (2014)**

**Authors**: Mathys, C., Lomakina, E. I., & Daunizeau, J.  
**Link**: [Frontiers in Human Neuroscience](https://www.frontiersin.org/articles/10.3389/fnhum.2014.00825/full)

**Why read it?** A key follow-up paper that provides a more accessible overview and further details on the model's application to perception.

### 🛠️ Toolboxes & Code

#### 1. **TAPAS (Translational Algorithms for Psychiatry-Advancing Science)**

**Link**: [TNU Website](https://www.tnu.ethz.ch/de/software/tapas)  
**Language**: MATLAB

**What is it?** The original, open-source MATLAB toolbox for implementing the HGF and other computational models. It's the gold standard in the research community and is incredibly well-documented.

#### 2. **PyHGF**

**Link**: [GitHub Repository](https://github.com/ComputationalPsychiatry/pyhgf)  
**Language**: Python

**What is it?** The Python implementation we used in our code sample. Great for Python developers with excellent documentation and examples.

#### 3. **hBayesDM (Hierarchical Bayesian Modeling)**

**Link**: [hBayesDM Website](https://ccs-lab.github.io/hBayesDM/)  
**Language**: R

**What is it?** An R package that makes it easy to fit a wide range of computational models, including the HGF, to behavioral data. Built on top of Stan.

#### 4. **SPM (Statistical Parametric Mapping)**

**Link**: [SPM Website](https://www.fil.ion.ucl.ac.uk/spm/)  
**Language**: MATLAB

**What is it?** A comprehensive toolkit for neuroimaging analysis that includes HGF implementations.

### 🎓 Online Courses & Tutorials

#### 1. **Computational Psychiatry Course**

**Link**: [Computational Psychiatry Course](https://www.translationalneuromodeling.org/cpcourse/)  
**Instructor**: Various experts

**What you'll learn**: Comprehensive introduction to computational psychiatry methods and applications through hands-on tutorials and materials.

### 🔬 Research Groups & Communities

#### 1. **Translational Neuromodeling Unit (TNU)**

**Link**: [TNU Website](https://www.tnu.ethz.ch/)  
**Focus**: Computational psychiatry and neuroimaging

### 🎓 Comprehensive Preparation Resources

#### **Computational Psychiatry Course Preparation**

**Link**: [Precourse Preparation Repository](https://github.com/computational-psychiatry-course/precourse-preparation)  
**What it is**: Curated collection of MOOCs, reading materials, and tutorials covering all foundational knowledge needed for computational psychiatry

**What you'll find**:

##### 🧠 **Basic and Applied Neuroscience**

- **Fundamental Neuroscience for neuroimaging** (Johns Hopkins University)
- **Understanding the Brain: The Neurobiology of Everyday Life** (University of Chicago)
- **Medical Neuroscience** (Duke University)

##### 💥 **Neuroimaging**

- **Principles of fMRI 1 & 2** (Johns Hopkins University)

##### 📐 **Mathematics Foundation**

- **Linear Algebra** (Khan Academy) + Essence of linear algebra (3Blue1Brown)
- **Calculus 1** (Khan Academy & Ohio State University)
- **Differential Equations** (Khan Academy)

##### 🎲 **Statistics & Probability**

- **Mathematical Basics/Primers of Modelling** (Yu Yao, CPC Zurich 2020)
- **Statistics and Probability** (Khan Academy)
- **Bayesian Statistics and Modelling** (van de Shoot et al., Nature Reviews Methods Primers, 2021)
- **Statistical Thinking for the 21st century** (Poldrack, open-source book)

##### 💻 **Programming**

- **Introduction to Programming with MATLAB** (Vanderbilt University)
- **R programming** (Johns Hopkins University)
- **Julia tutorials** (comprehensive list)

##### 🤖 **Machine Learning**

- **Machine Learning** (Stanford University)

**Why use it?** This repository provides a complete roadmap for building the mathematical, statistical, and programming foundation needed to excel in computational psychiatry courses and research.

---

**Happy coding, and happy learning!** 🧠💻✨

_Got questions? Found a great resource we missed? Let us know in the comments!_
