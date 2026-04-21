<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="CourseEdit.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Courses.CourseEditPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2><asp:Literal ID="litTitle" runat="server" Text="Add Course" /></h2>

    <asp:ValidationSummary ID="ValidationSummary1" runat="server" CssClass="validation-summary" />

    <div class="form-group">
        <asp:Label runat="server" AssociatedControlID="txtCourseID" Text="Course Number:" />
        <asp:TextBox ID="txtCourseID" runat="server" />
        <asp:RequiredFieldValidator runat="server" ControlToValidate="txtCourseID"
            ErrorMessage="Course number is required." Display="Dynamic" />
        <asp:RangeValidator runat="server" ControlToValidate="txtCourseID" Type="Integer"
            MinimumValue="1" MaximumValue="9999" ErrorMessage="Must be 1-9999." Display="Dynamic" />
    </div>

    <div class="form-group">
        <asp:Label runat="server" AssociatedControlID="txtTitle" Text="Title:" />
        <asp:TextBox ID="txtTitle" runat="server" MaxLength="50" />
        <asp:RequiredFieldValidator runat="server" ControlToValidate="txtTitle"
            ErrorMessage="Title is required." Display="Dynamic" />
    </div>

    <div class="form-group">
        <asp:Label runat="server" AssociatedControlID="txtCredits" Text="Credits:" />
        <asp:TextBox ID="txtCredits" runat="server" TextMode="Number" />
        <asp:RangeValidator runat="server" ControlToValidate="txtCredits" Type="Integer"
            MinimumValue="0" MaximumValue="5" ErrorMessage="Credits must be 0-5." Display="Dynamic" />
    </div>

    <div class="form-group">
        <asp:Label runat="server" AssociatedControlID="ddlDepartment" Text="Department:" />
        <asp:DropDownList ID="ddlDepartment" runat="server" />
        <asp:RequiredFieldValidator runat="server" ControlToValidate="ddlDepartment"
            InitialValue="" ErrorMessage="Department is required." Display="Dynamic" />
    </div>

    <div class="form-actions">
        <asp:Button ID="btnSave" runat="server" Text="Save" OnClick="btnSave_Click" CssClass="btn-primary" />
        <asp:HyperLink runat="server" NavigateUrl="CourseList.aspx" Text="Cancel" CssClass="btn-secondary" />
    </div>
</asp:Content>
