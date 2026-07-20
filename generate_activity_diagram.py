import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.path import Path

def create_diagram():
    # Setup high-quality academic figure (black & white theme)
    fig, ax = plt.subplots(figsize=(16, 17), dpi=300)
    ax.set_xlim(0, 18)
    ax.set_ylim(0, 17)
    ax.axis('off')
    
    # White background for paper suitability
    fig.patch.set_facecolor('#FFFFFF')
    
    # Title at the top
    ax.text(9.0, 16.4, "Figure 4.4: Activity Diagram – User Registration", ha='center', va='center', 
            fontsize=15, fontweight='bold', color='#000000', fontname='DejaVu Sans')
    
    # Helper to draw rounded activity nodes (UML style)
    def draw_activity_node(x, y, w, h, text):
        box = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.08",
            ec="#000000", fc="#FFFFFF", lw=1.5
        )
        ax.add_patch(box)
        ax.text(x + w/2, y + h/2, text, ha='center', va='center', 
                fontsize=9.5, color='#000000', fontname='DejaVu Sans', fontweight='medium')

    # Helper to draw decision diamonds (UML style)
    def draw_decision_diamond(cx, cy, hw, hh, text):
        # Vertices of the diamond
        verts = [
            (cx, cy + hh),      # Top
            (cx + hw, cy),      # Right
            (cx, cy - hh),      # Bottom
            (cx - hw, cy),      # Left
            (cx, cy + hh)       # Close path
        ]
        codes = [Path.MOVETO, Path.LINETO, Path.LINETO, Path.LINETO, Path.CLOSEPOLY]
        path = Path(verts, codes)
        patch = patches.PathPatch(path, facecolor='#FFFFFF', edgecolor='#000000', lw=1.5)
        ax.add_patch(patch)
        if text:
            ax.text(cx, cy, text, ha='center', va='center', 
                    fontsize=9, color='#000000', fontname='DejaVu Sans', fontweight='bold')

    # Standard Box size
    box_w = 4.0
    box_h = 0.8
    col_mid = 9.0  # Center column X axis

    # Draw Nodes:
    # 1. Initial Node (Solid Black Circle)
    initial_node = patches.Circle((col_mid, 15.7), 0.14, ec="#000000", fc="#000000")
    ax.add_patch(initial_node)

    # 2. Open Registration Page
    draw_activity_node(col_mid - box_w/2, 14.3, box_w, box_h, "Open Registration Page")

    # 3. Enter User Details
    draw_activity_node(col_mid - box_w/2, 12.8, box_w, box_h, "Enter User Details\n(Name, Email, Password, Confirm)")

    # 4. Validate Input
    draw_activity_node(col_mid - box_w/2, 11.5, box_w, box_h, "Validate Input")

    # 5. Decision Diamond 1 (Valid?)
    draw_decision_diamond(col_mid, 10.3, 1.0, 0.5, "Valid?")

    # 5a. Validation Error Box (No branch)
    draw_activity_node(13.0, 9.9, box_w - 0.5, box_h, "Display Validation Error")

    # 6. Check Email Already Exists?
    draw_activity_node(col_mid - box_w/2, 8.7, box_w, box_h, "Check Email Already Exists?")

    # 7. Decision Diamond 2 (Email Exists?)
    draw_decision_diamond(col_mid, 7.5, 1.0, 0.5, "Exists?")

    # 7a. Email Exists Warning Box (Yes branch)
    draw_activity_node(1.5, 7.1, box_w, box_h, "Show \"Email Already\nRegistered\" Message")

    # 8. Hash Password
    draw_activity_node(col_mid - box_w/2, 5.9, box_w, box_h, "Hash Password using BCrypt")

    # 9. Save User Data
    draw_activity_node(col_mid - box_w/2, 4.5, box_w, box_h, "Save User Data to MongoDB")

    # 10. Registration Successful
    draw_activity_node(col_mid - box_w/2, 3.1, box_w, box_h, "Registration Successful")

    # 11. Redirect to Login Page
    draw_activity_node(col_mid - box_w/2, 1.7, box_w, box_h, "Redirect to Login Page")

    # 12. Final Node (Double Circle)
    final_node_outer = patches.Circle((col_mid, 0.7), 0.22, ec="#000000", fc="#FFFFFF", lw=1.5)
    final_node_inner = patches.Circle((col_mid, 0.7), 0.12, ec="#000000", fc="#000000")
    ax.add_patch(final_node_outer)
    ax.add_patch(final_node_inner)


    # DRAW FLOW ARROWS (Solid black lines with arrows)
    def draw_uml_arrow(x1, y1, x2, y2, label="", label_offset_x=0.15, label_offset_y=0.0, ha='left', va='center'):
        arrow = patches.FancyArrowPatch(
            (x1, y1), (x2, y2),
            arrowstyle="-|>",
            mutation_scale=14,
            ec="#000000", fc="#000000", lw=1.5
        )
        ax.add_patch(arrow)
        if label:
            ax.text((x1+x2)/2 + label_offset_x, (y1+y2)/2 + label_offset_y, label, 
                    ha=ha, va=va, fontsize=9.5, color='#000000', fontname='DejaVu Sans')

    # Draw multi-segment lines manually to avoid overlapping/crossing component boxes
    def draw_multisegment_arrow(points, label="", label_pos=None):
        for i in range(len(points) - 2):
            ax.plot([points[i][0], points[i+1][0]], [points[i][1], points[i+1][1]], color='#000000', lw=1.5)
        # Final arrow segment
        p_penultimate = points[-2]
        p_last = points[-1]
        arrow = patches.FancyArrowPatch(
            p_penultimate, p_last,
            arrowstyle="-|>",
            mutation_scale=14,
            ec="#000000", fc="#000000", lw=1.5
        )
        ax.add_patch(arrow)
        if label and label_pos:
            ax.text(label_pos[0], label_pos[1], label, ha='center', va='bottom', fontsize=9.5, color='#000000', fontname='DejaVu Sans')

    # Initial -> Open Page
    draw_uml_arrow(col_mid, 15.56, col_mid, 15.1)
    
    # Open Page -> Enter Details
    draw_uml_arrow(col_mid, 14.3, col_mid, 13.6)
    
    # Enter Details -> Validate Input
    draw_uml_arrow(col_mid, 12.8, col_mid, 12.3)
    
    # Validate Input -> Decision 1 (Valid?)
    draw_uml_arrow(col_mid, 11.5, col_mid, 10.8)

    # Decision 1 [No] -> Display Error
    draw_uml_arrow(col_mid + 1.0, 10.3, 13.0, 10.3, label="[No]", label_offset_y=0.12, ha='center', va='bottom')
    
    # Display Error -> Loop back to Enter Details (rectilinear path around text boxes)
    # Right edge of error box is at 16.5, Y=10.3. Route: right to 17.2 -> up to 13.2 -> left to 11.0 (Enter Details right edge)
    draw_multisegment_arrow([(16.5, 10.3), (17.2, 10.3), (17.2, 13.2), (11.0, 13.2)])

    # Decision 1 [Yes] -> Check Email
    draw_uml_arrow(col_mid, 9.8, col_mid, 9.5, label="[Yes]", label_offset_x=0.15, label_offset_y=0.0, ha='left', va='center')

    # Check Email -> Decision 2 (Exists?)
    draw_uml_arrow(col_mid, 8.7, col_mid, 8.0)

    # Decision 2 [Yes] -> Show Warning Box (Leftwards)
    draw_uml_arrow(col_mid - 1.0, 7.5, 5.5, 7.5, label="[Yes]", label_offset_y=0.12, ha='center', va='bottom')

    # Show Warning Box -> Loop back to Enter Details (rectilinear path around text boxes)
    # Left edge of warning box is at 1.5, Y=7.5. Route: left to 0.8 -> up to 13.2 -> right to 7.0 (Enter Details left edge)
    draw_multisegment_arrow([(1.5, 7.5), (0.8, 7.5), (0.8, 13.2), (7.0, 13.2)])

    # Decision 2 [No] -> Hash Password
    draw_uml_arrow(col_mid, 7.0, col_mid, 6.7, label="[No]", label_offset_x=0.15, label_offset_y=0.0, ha='left', va='center')

    # Hash Password -> Save User Data
    draw_uml_arrow(col_mid, 5.9, col_mid, 5.3)

    # Save User Data -> Registration Successful
    draw_uml_arrow(col_mid, 4.5, col_mid, 3.9)

    # Registration Successful -> Redirect Login
    draw_uml_arrow(col_mid, 3.1, col_mid, 2.5)

    # Redirect Login -> Final Node
    draw_uml_arrow(col_mid, 1.7, col_mid, 0.92)

    # Save diagram
    plt.savefig("activity_diagram_registration.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("Successfully generated activity diagram at activity_diagram_registration.png")

if __name__ == "__main__":
    create_diagram()
