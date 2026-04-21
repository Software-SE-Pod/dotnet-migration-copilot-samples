<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="InstructorEdit.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Instructors.InstructorEditPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2><asp:Literal ID="litTitle" runat="server" Text="Add Instructor" /></h2>

    <asp:ValidationSummary ID="vs" runat="server" CssClass="validation-summary" />

    <div class="form-group">
        <asp:Label runat="server" Text="Last Name:" AssociatedControlID="txtLastName" />
        <asp:TextBox ID="txtLastName" runat="server" MaxLength="50" />
        <asp:RequiredFieldValidator runat="server" ControlToValidate="txtLastName"
            ErrorMessage="Last name is required." Display="Dynamic" />
    </div>

    <div class="form-group">
        <asp:Label runat="server" Text="First Name:" AssociatedControlID="txtFirstName" />
        <asp:TextBox ID="txtFirstName" runat="server" MaxLength="50" />
        <asp:RequiredFieldValidator runat="server" ControlToValidate="txtFirstName"
            ErrorMessage="First name is required." Display="Dynamic" />
    </div>

    <div class="form-group">
        <asp:Label runat="server" Text="Hire Date:" AssociatedControlID="txtHireDate" />
        <asp:TextBox ID="txtHireDate" runat="server" TextMode="Date" />
    </div>

    <div class="form-group">
        <asp:Label runat="server" Text="Office Location:" AssociatedControlID="txtOffice" />
        <asp:TextBox ID="txtOffice" runat="server" MaxLength="50" />
    </div>

    <div class="form-group">
        <asp:Label runat="server" Text="Courses:" />
        <asp:CheckBoxList ID="cblCourses" runat="server"
            DataTextField="Title" DataValueField="CourseID"
            RepeatDirection="Vertical" />
    </div>

    <div class="form-actions">
        <asp:Button ID="btnSave" runat="server" Text="Save" OnClick="btnSave_Click" CssClass="btn-primary" />
        <asp:HyperLink runat="server" NavigateUrl="InstructorList.aspx" Text="Cancel" CssClass="btn-secondary" />
    </div>
</asp:Content>
