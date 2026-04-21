<%@ Page Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="CourseList.aspx.cs" Inherits="ContosoUniversity.WebForms.Pages.Courses.CourseListPage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainContent" runat="server">
    <h2>Courses</h2>

    <div class="filter-bar">
        <asp:Label ID="lblDeptFilter" runat="server" Text="Department:" AssociatedControlID="ddlDepartment" />
        <asp:DropDownList ID="ddlDepartment" runat="server" AutoPostBack="true"
            OnSelectedIndexChanged="ddlDepartment_SelectedIndexChanged" AppendDataBoundItems="true">
            <asp:ListItem Text="-- All --" Value="" />
        </asp:DropDownList>
    </div>

    <asp:GridView ID="gvCourses" runat="server"
        AutoGenerateColumns="False"
        DataKeyNames="CourseID"
        AllowPaging="True"
        PageSize="15"
        OnPageIndexChanging="gvCourses_PageIndexChanging"
        CssClass="data-grid"
        EmptyDataText="No courses found.">
        <Columns>
            <asp:BoundField DataField="CourseID" HeaderText="Number" />
            <asp:BoundField DataField="Title" HeaderText="Title" />
            <asp:BoundField DataField="Credits" HeaderText="Credits" />
            <asp:TemplateField HeaderText="Department">
                <ItemTemplate><%# Eval("Department.Name") %></ItemTemplate>
            </asp:TemplateField>
            <asp:TemplateField HeaderText="Enrolled">
                <ItemTemplate><%# Eval("Enrollments.Count") %></ItemTemplate>
            </asp:TemplateField>
            <asp:HyperLinkField Text="Edit"
                DataNavigateUrlFields="CourseID"
                DataNavigateUrlFormatString="CourseEdit.aspx?id={0}" />
        </Columns>
    </asp:GridView>

    <p><a href="CourseEdit.aspx">Add New Course</a></p>
</asp:Content>
