registerStudyGuide({
  topic: "Geometry",
  icon: "📐",
  summary: "Geometry covers shapes, angles, lines, symmetry and careful diagram reading.",
  intro: "Geometry questions become easier when you spot the rule hidden in the shape or angle diagram.",
  keyIdea: "Use facts you already know to unlock what you do not know yet.",
  visualLabel: "A geometry card showing shape and angle facts.",
  visual: createStudyVisualCard({
    emoji: "📐",
    title: "Shapes and angles",
    subtitle: "Use known facts to find the missing part",
    chips: ["Triangle = 180°", "Line = 180°", "Point = 360°", "Right angle = 90°"],
    accent: "#6366f1"
  }),
  concepts: [
    {
      title: "Shape Properties",
      summary: "Each shape has special features such as sides, angles and symmetry.",
      explanation: [
        "Geometry starts with shape facts. For example, an isosceles triangle has two equal sides and two equal base angles, a square has four equal sides and four right angles, and regular polygons have all sides and all interior angles equal.",
        "A key polygon formula is: sum of interior angles = (n - 2) × 180 degrees, where n is the number of sides. For a regular polygon, one interior angle = ((n - 2) × 180) ÷ n, and one exterior angle = 360 ÷ n."
      ],
      steps: [
        "Name the shape and count its sides if needed.",
        "Write down the known property or formula for that shape.",
        "Substitute the correct values, such as n into the polygon-angle formula.",
        "Check the answer agrees with the shape being regular, isosceles, right-angled or another type."
      ],
      tips: [
        "A square has 4 equal sides and 4 right angles.",
        "An isosceles triangle has 2 equal sides and 2 equal angles.",
        "Regular shapes have equal sides and equal angles."
      ],
      examples: [
        { title: "Regular polygon", text: "For a regular hexagon, n = 6, so sum of interior angles = (6 - 2) × 180 = 720 degrees. One interior angle = 720 ÷ 6 = 120 degrees." },
        { title: "Isosceles triangle", text: "If one base angle is 50 degrees in an isosceles triangle, the other base angle is also 50 degrees, so the top angle is 180 - 50 - 50 = 80 degrees." }
      ],
      visualLabel: "A properties card showing common shape facts.",
      visual: createStudyVisualCard({ emoji: "⬜", title: "Know the shape", subtitle: "Properties help you reason", chips: ["Square", "Rectangle", "Triangle", "Regular"], accent: "#6366f1" })
    },
    {
      title: "Angle Facts",
      summary: "Angle rules help you work out missing angles without guessing.",
      explanation: [
        "Core angle facts include: angles on a straight line add to 180 degrees, angles around a point add to 360 degrees, vertically opposite angles are equal, and angles in a triangle add to 180 degrees.",
        "Quadrilateral interior angles add to 360 degrees, and regular polygon questions can often be linked back to the formula (n - 2) × 180 degrees. Writing the correct total before subtracting is the safest method."
      ],
      steps: [
        "Identify which angle fact matches the diagram.",
        "Write the full total, such as 180 degrees or 360 degrees.",
        "Set up the missing angle as total minus the known parts.",
        "Check the answer fits the diagram and is not too large or too small."
      ],
      tips: [
        "Angles on a straight line add to 180°.",
        "Angles around a point add to 360°.",
        "Angles in a triangle add to 180°."
      ],
      examples: [
        { title: "Straight line", text: "Angles on a straight line add to 180 degrees, so if one angle is 65 degrees the other is 180 - 65 = 115 degrees." },
        { title: "Quadrilateral", text: "If three angles in a quadrilateral are 90, 85 and 100 degrees, the fourth is 360 - (90 + 85 + 100) = 85 degrees." }
      ],
      visualLabel: "An angle facts card showing the key totals used in geometry.",
      visual: createStudyVisualCard({ emoji: "📐", title: "Use the angle facts", subtitle: "Write the total first", chips: ["180° line", "360° point", "180° triangle", "Subtract"], accent: "#0ea5e9" })
    },
    {
      title: "Parallel Lines & Special Angles",
      summary: "Parallel lines create matching angle patterns.",
      explanation: [
        "When a transversal crosses parallel lines, several angle pairs follow fixed rules. Corresponding angles are equal, alternate angles are equal, and co-interior angles sum to 180 degrees.",
        "The main skill is spotting which angles are in matching positions. Once the pair is identified, the calculation is usually short."
      ],
      steps: [
        "Find the pair of parallel lines on the diagram.",
        "Locate the unknown angle and decide whether it is corresponding, alternate or co-interior to a known angle.",
        "Use equality or the 180-degree sum rule to calculate the missing angle.",
        "Check the positions really match before finalising the answer."
      ],
      tips: [
        "Corresponding angles are equal.",
        "Alternate angles are equal.",
        "Co-interior angles add to 180°."
      ],
      examples: [
        { title: "Corresponding", text: "If one corresponding angle is 55 degrees, the angle in the matching position on the other parallel line is also 55 degrees." },
        { title: "Co-interior", text: "Co-interior angles add to 180 degrees, so if one is 110 degrees the other is 180 - 110 = 70 degrees." }
      ],
      visualLabel: "A parallel-lines card showing matching angle relationships.",
      visual: createStudyVisualCard({ emoji: "∥", title: "Parallel lines", subtitle: "Look for the angle pattern", chips: ["Corresponding", "Alternate", "Co-interior", "Match positions"], accent: "#f59e0b" })
    },
    {
      title: "Symmetry, Coordinates & Movement",
      summary: "Geometry also includes reflection, turns and position on a grid.",
      explanation: [
        "Coordinate questions use ordered pairs (x, y), where x tells you how far across and y tells you how far up. Reflection means mirroring a point or shape across a line, so corresponding points stay the same perpendicular distance from the mirror line.",
        "Transformation questions may ask for reflection, translation or rotation. The rule is to keep size and shape the same while changing position or orientation correctly."
      ],
      steps: [
        "Read the coordinates or transformation instruction carefully.",
        "Plot the original point or identify the original shape.",
        "Count equal horizontal and vertical moves, or equal distances from the mirror line.",
        "Check the new image is the correct distance, direction and orientation."
      ],
      tips: [
        "Coordinates are written as (x, y).",
        "x comes before y.",
        "A reflected shape should be the same distance from the mirror line."
      ],
      examples: [
        { title: "Coordinates", text: "The point (3, 5) means move 3 units along the x-axis and then 5 units up the y-axis." },
        { title: "Reflection", text: "If a point is 2 squares left of a vertical mirror line, its image must be 2 squares right of that same line." }
      ],
      visualLabel: "A geometry movement card showing coordinates and symmetry.",
      visual: createStudyVisualCard({ emoji: "🪞", title: "Move and reflect", subtitle: "Use the grid carefully", chips: ["(x, y)", "Symmetry", "Reflect", "Translate"], accent: "#22c55e" })
    }
  ]
});
