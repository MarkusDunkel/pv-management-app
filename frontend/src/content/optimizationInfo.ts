export const optimizationInfoMarkdown = `
# Panel Size Optimization

Maximizing the benefits of a photovoltaic (PV) system requires selecting an optimal panel capacity. 
Depending on household consumption patterns, PV production characteristics, and financial 
parameters—including investment costs, electricity selling prices, and panel purchase costs—it 
is possible to identify the panel size that maximizes overall energy savings.

The objective is to express total monetary costs as a function of PV capacity. 
The following section describes the energy and cost balances used for this calculation. 

The daily PV production and consumption balances (in kWh/day) are:

$$
E_{\\text{pv}} = E_{\\text{fit}} + E_{\\text{excess}}, 
$$
$$
E_{\\text{demand}} = E_{\\text{fit}} + E_{\\text{lack}}. 
$$

where $E_{\\text{fit}}$ is the solar energy that is immediately consumed by the household, 
$E_{\\text{excess}}$ is the solar energy that surpasses consumption and must be sold, 
and $E_{\\text{lack}}$ is the consumption that cannot be met by production of solar energy.

To maintain consistent units, all monetary terms are expressed in €/day, and all energy terms in kWh/day.
Thus, the daily electricity costs become:

$$
C_{\\text{total}} = C_{\\text{fit}} + C_{\\text{excess}} + C_{\\text{grid}}.
$$

## Cost Components

### Self-Consumed PV Electricity

Self-consumed PV electricity is assigned the investment-derived cost per kWh produced:

$$
C_{\\text{fit}} = E_{\\text{fit}} \\cdot
 c_{\\text{panel}} \\cdot η^{-1} \\cdot r.
$$

Here:
- $c_{\\text{panel}} \\cdot η^{-1} \\cdot r$ is the effective panel cost per kWh produced,
    - where $c_{\\text{panel}}$ [€/kWp] is the panel purchase cost per kilowatt-peak,
    - $η$ [1] an efficiency factor (see below) and
    - $r$ [1/h] is the reciprocal of the reinvestment (or amortization) time $T_{\\text{h}}$, e.g. $r=(T_{\\text{h}})^{-1}$.

### Excess PV Electricity (Exported)

Electricity exported to the grid yields income at the selling price:

$$
C_{\\text{excess}} = E_{\\text{excess}} \\cdot
\\bigl(c_{\\text{panel}} \\cdot η^{-1} \\cdot r - c_{\\text{sell}}\\bigr).
$$

where $c_{\\text{sell}}$ [€/kWh] is the electricity selling price

### Purchased Electricity (Grid Consumption)

Any remaining demand must be covered by grid electricity and is treated as a cost:

$$
C_{\\text{grid}} = E_{\\text{lack}} \\cdot c_{\\text{grid}}.
$$

where $c_{\\text{grid}}$ [€/kWh] is the electricity purchase price

## Efficiency Factor

The efficiency factor $η$ compares the actual daily PV production at the specific location and climate to the theoretical daily production under idealized laboratory conditions (e.g. constant maximal radiation over the whole day):

$$
η =
\\frac{\\int_{0}^{24\\,\\mathrm{h}} P_{\\text{mean}}(t) \\, \\mathrm{d}t}{P_{\\text{lab}} \\cdot 24\\,\\mathrm{h}},
$$

where
- $P_{\\text{mean}}(t)$ [kW]: actual average power output over the day and
- $P_{\\text{lab}}$ [kWp]: nominal panel power under lab conditions,
`;
