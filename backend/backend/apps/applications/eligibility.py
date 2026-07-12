from django.utils import timezone


def check_student_eligibility(student, job):
    """
    Returns:
    {
        "eligible": True/False,
        "reasons": []
    }
    """

    reasons = []

    # ----------------------------
    # Deadline Check
    # ----------------------------

    if timezone.now() > job.application_deadline:
        reasons.append("Application deadline has passed.")

    # ----------------------------
    # Job Active
    # ----------------------------

    if not job.is_active:
        reasons.append("This job is no longer active.")

    # ----------------------------
    # Student Profile
    # ----------------------------

    profile = getattr(student, "student_profile", None)

    if profile is None:
        reasons.append("Student profile is incomplete.")

        return {
            "eligible": False,
            "reasons": reasons,
        }

    # ----------------------------
    # Profile Verification
    # ----------------------------

    if not profile.is_verified:
        reasons.append(
            "Your profile has not been verified by the Placement Officer."
        )

    # ----------------------------
    # CGPA
    # ----------------------------

    if profile.cgpa is None:
        reasons.append("CGPA is not available in your profile.")
    elif profile.cgpa < job.min_cgpa:
        reasons.append(
            f"Minimum CGPA required is {job.min_cgpa}."
        )

    # ----------------------------
    # Branch
    # ----------------------------

    if job.eligible_branches:

        if not profile.branch:
            reasons.append("Branch is missing in your profile.")

        elif profile.branch not in job.eligible_branches:
            reasons.append(
                f"{profile.branch} branch is not eligible."
            )

    # ----------------------------
    # Passing Year
    # ----------------------------

    if (
        job.drive
        and job.drive.company.eligibility_criteria.exists()
    ):

        criteria = job.drive.company.eligibility_criteria.first()

        if criteria.eligible_passing_years:

            if not profile.passing_year:
                reasons.append("Passing year is missing in your profile.")

            elif profile.passing_year not in criteria.eligible_passing_years:
                reasons.append(
                    f"Passing year {profile.passing_year} is not eligible."
                )
                
    return {
        "eligible": len(reasons) == 0,
        "reasons": reasons,
    }

    

    