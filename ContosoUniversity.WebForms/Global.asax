<%@ Application Language="C#" %>
<script runat="server">
    void Application_Start(object sender, EventArgs e)
    {
        System.Data.Entity.Database.SetInitializer(
            new ContosoUniversity.WebForms.Data.SchoolInitializer());
    }

    void Application_Error(object sender, EventArgs e)
    {
        // Log to event log in production
    }

    void Session_Start(object sender, EventArgs e)
    {
        Session["UserPreferences"] = new System.Collections.Hashtable();
    }
</script>
